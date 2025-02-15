import { Injectable } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { BankAccountRepository } from '../repositories/repository/bank-account.repository';
import { BankAccountEntity } from '../repositories/entities/bank-account.entity';
import { BankAccountNotFoundException } from '../errors/bank-account.notfound.error';
import { ResponseBankAccountDto } from '../dtos/bank-account.response.dto';
import { CreateBankAccountDto } from '../dtos/bank-account.create.dto';
import { UpdateBankAccountDto } from '../dtos/bank-account.update.dto';
import { BankAccountAlreadyExistsException } from '../errors/bank-account.alreadyexists.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { BankAccountCannotBeDeletedException } from '../errors/bank-account.cannotbedeleted.error';

@Injectable()
export class BankAccountService {
  constructor(private readonly bankAccountRepository: BankAccountRepository) {}

  //return a sorted list of bank accounts
  sortedBankAccounts(bankAccounts: BankAccountEntity[]): BankAccountEntity[] {
    return bankAccounts.sort((a, b) => {
      const aIsMain = a?.isMain ?? false;
      const bIsMain = b?.isMain ?? false;
      return Number(bIsMain) - Number(aIsMain);
    });
  }

  async findOneById(id: number): Promise<BankAccountEntity> {
    const account = await this.bankAccountRepository.findOneById(id);
    if (!account) {
      throw new BankAccountNotFoundException();
    }
    return account;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseBankAccountDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const account = await this.bankAccountRepository.findOne(
      queryOptions as FindOneOptions<BankAccountEntity>,
    );
    if (!account) return null;
    return account;
  }

  async findAll(query: IQueryObject): Promise<ResponseBankAccountDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return this.sortedBankAccounts(
      await this.bankAccountRepository.findAll(
        queryOptions as FindManyOptions<BankAccountEntity>,
      ),
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseBankAccountDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.bankAccountRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = this.sortedBankAccounts(
      await this.bankAccountRepository.findAll(
        queryOptions as FindManyOptions<BankAccountEntity>,
      ),
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: parseInt(query.page),
        take: parseInt(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async doesBankAccountExist(
    bankAccount: Partial<BankAccountEntity>,
  ): Promise<boolean> {
    const existingBankAccount = await this.bankAccountRepository.findOne({
      where: {
        iban: bankAccount.iban,
        rib: bankAccount.rib,
        deletedAt: null,
      },
    });
    return !!existingBankAccount;
  }

  async findMainAccount(): Promise<BankAccountEntity> {
    return this.bankAccountRepository.findOne({
      where: { isMain: true },
    });
  }

  //promote bank account to main account
  async promote(account: BankAccountEntity): Promise<BankAccountEntity> {
    account.isMain = true;
    account.isDeletionRestricted = true;
    return this.bankAccountRepository.save(account);
  }

  //demote bank account to normal account
  async demote(account: BankAccountEntity): Promise<BankAccountEntity> {
    account.isMain = false;
    account.isDeletionRestricted = false;
    return this.bankAccountRepository.save(account);
  }

  async save(
    createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccountEntity> {
    if (await this.doesBankAccountExist(createBankAccountDto)) {
      throw new BankAccountAlreadyExistsException();
    }
    //handle the case when there is no bank account , set the current account as main by default
    let isDeletionRestricted = false;
    const count = await this.bankAccountRepository.getTotalCount();
    if (count == 0) {
      createBankAccountDto.isMain = true;
      isDeletionRestricted = true;
    }
    //handle main account transition
    if (createBankAccountDto.isMain) {
      const currentMainAccount = await this.findMainAccount();
      if (currentMainAccount) {
        this.demote(currentMainAccount);
      }
    }
    return this.bankAccountRepository.save({
      ...createBankAccountDto,
      isDeletionRestricted,
    });
  }

  async saveMany(
    createBankAccountDto: CreateBankAccountDto[],
  ): Promise<BankAccountEntity[]> {
    for (const dto of createBankAccountDto) {
      if (await this.doesBankAccountExist(dto)) {
        throw new BankAccountAlreadyExistsException();
      }
    }
    return this.bankAccountRepository.saveMany(createBankAccountDto);
  }

  async update(
    id: number,
    updateBankAccountDto: UpdateBankAccountDto,
  ): Promise<BankAccountEntity> {
    if (!(await this.doesBankAccountExist(updateBankAccountDto))) {
      throw new BankAccountNotFoundException();
    }
    if (updateBankAccountDto.isMain) {
      const currentMainAccount = await this.findMainAccount();
      if (currentMainAccount) {
        this.demote(currentMainAccount);
      }
    }
    const existingBankAccount = await this.findOneById(id);
    return this.bankAccountRepository.save({
      ...existingBankAccount,
      ...updateBankAccountDto,
      isDeletionRestricted: updateBankAccountDto.isMain,
    });
  }

  async softDelete(id: number): Promise<BankAccountEntity> {
    const account = await this.findOneById(id);
    if (account.isMain) throw new BankAccountCannotBeDeletedException();
    return this.bankAccountRepository.softDelete(id);
  }

  async deleteAll() {
    return this.bankAccountRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.bankAccountRepository.getTotalCount();
  }
}
