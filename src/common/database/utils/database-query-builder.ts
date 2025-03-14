import {
  Between,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import {
  ILooseObject,
  IOptionsObject,
  IQueryObject,
  IQueryTypeOrm,
} from '../interfaces/database-query-options.interface';

export class QueryBuilder {
  private options: IOptionsObject;

  constructor(configuration: IOptionsObject = {}) {
    this.options = {
      LOOKUP_DELIMITER: '||',
      RELATION_DELIMITER: '.',
      CONDITION_DELIMITER: ';',
      VALUE_DELIMITER: ',',
      EXACT: '$eq',
      NOT: '!',
      CONTAINS: '$cont',
      IS_NULL: '$isnull',
      GT: '$gt',
      GTE: '$gte',
      LT: '$lt',
      LTE: '$lte',
      STARTS_WITH: '$starts',
      ENDS_WITH: '$ends',
      IN: '$in',
      BETWEEN: '$between',
      OR: '$or',
      DEFAULT_LIMIT: '25',
      ...configuration,
    };
  }

  /**
   * Retourne les options de configuration du QueryBuilder.
   */
  public getOptions(): IOptionsObject {
    return this.options;
  }

  /**
   * Construit un objet de requête TypeORM à partir d'un objet de requête personnalisé.
   * @param query - L'objet de requête personnalisé.
   * @returns Un objet de requête TypeORM.
   */
  public build(query: IQueryObject): IQueryTypeOrm {
    const output: IQueryTypeOrm = {};

    if (!this.isValueInvalid(query.select)) {
      output.select = this.parseSelect(query.select as string);
    }

    if (!this.isValueInvalid(query.join)) {
      output.relations = this.parseJoin(query.join as string);
    }

    if (!this.isValueInvalid(query.sort)) {
      output.order = this.createOrderArray(query.sort as string);
    }

    if (!this.isValueInvalid(query.cache)) {
      output.cache = this.parseCache(query.cache as string);
    }

    if (!this.isValueInvalid(query.limit)) {
      output.take = this.parseLimit(query.limit as string);
    }

    if (!this.isValueInvalid(query.page)) {
      const limit = query.limit || this.options.DEFAULT_LIMIT;
      output.skip = this.calculateSkip(query.page as string, limit);
      output.take = this.parseLimit(limit);
    }

    if (!this.isValueInvalid(query.filter)) {
      output.where = this.createWhere(query.filter as string);
    }

    return output;
  }

  /**
   * Vérifie si une valeur est invalide (null, undefined ou vide).
   * @param value - La valeur à vérifier.
   * @returns True si la valeur est invalide, sinon False.
   */
  private isValueInvalid(value: string | undefined): boolean {
    return !value || value.trim() === '';
  }

  /**
   * Parse la chaîne de sélection en un tableau de champs.
   * @param select - La chaîne de sélection.
   * @returns Un tableau de champs.
   */
  private parseSelect(select: string): string[] {
    return select.split(this.options.VALUE_DELIMITER);
  }

  /**
   * Parse la chaîne de jointure en un tableau de relations.
   * @param join - La chaîne de jointure.
   * @returns Un tableau de relations.
   */
  private parseJoin(join: string): string[] {
    return join.split(this.options.VALUE_DELIMITER);
  }

  /**
   * Parse la chaîne de cache en un booléen.
   * @param cache - La chaîne de cache.
   * @returns Un booléen indiquant si le cache est activé.
   */
  private parseCache(cache: string): boolean {
    return JSON.parse(cache.toLowerCase());
  }

  /**
   * Parse la chaîne de limite en un nombre.
   * @param limit - La chaîne de limite.
   * @returns Un nombre représentant la limite.
   */
  private parseLimit(limit: string): number {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit)) {
      throw new Error('La limite doit être un nombre valide.');
    }
    return parsedLimit;
  }

  /**
   * Calcule la valeur de saut (skip) pour la pagination.
   * @param page - La chaîne de la page.
   * @param limit - La chaîne de la limite.
   * @returns Un nombre représentant la valeur de saut.
   */
  private calculateSkip(page: string, limit: string): number {
    const pageNumber = parseInt(page, 10);
    const limitNumber = this.parseLimit(limit);
    return limitNumber * (pageNumber - 1);
  }

  /**
   * Crée un tableau d'ordre à partir d'une chaîne de tri.
   * @param sortString - La chaîne de tri.
   * @returns Un objet représentant l'ordre.
   */
  private createOrderArray(sortString: string): { [key: string]: string } {
    const sortConditions = sortString.split(this.options.CONDITION_DELIMITER);
    const order: ILooseObject = {};

    sortConditions.forEach((condition) => {
      const [key, value] = condition.split(this.options.VALUE_DELIMITER);
      if (key) {
        this.assignObjectKey(order, key, (value || 'ASC').toUpperCase());
      }
    });

    return order;
  }

  /**
   * Crée un tableau de conditions WHERE à partir d'une chaîne de filtres.
   * @param filterString - La chaîne de filtres.
   * @returns Un tableau de conditions WHERE.
   */
  private createWhere(filterString: string): object[] {
    const queryToAdd: object[] = [];
    const orArray = filterString.split(
      `${this.options.LOOKUP_DELIMITER}${this.options.OR}${this.options.LOOKUP_DELIMITER}`,
    );

    orArray.forEach((item) => {
      let obj = {};
      const conditions = item.split(this.options.CONDITION_DELIMITER);

      conditions.forEach((condition) => {
        const [field, task, value] = condition.split(this.options.LOOKUP_DELIMITER);

        if (!field || !task) {
          throw new Error('Condition de filtre invalide : champ ou tâche manquant.');
        }

        if (value === 'NaN' || value === 'undefined' || value === 'null') {
          throw new Error(`Valeur de filtre invalide : ${value}. La valeur doit être un nombre ou une chaîne valide.`);
        }

        let notOperator = false;
        let modifiedTask = task;
        if (task.startsWith(this.options.NOT)) {
          notOperator = true;
          modifiedTask = task.slice(this.options.NOT.length);
        }

        obj = {
          ...obj,
          ...this.createWhereObject(field, modifiedTask, value, notOperator),
        };
      });

      queryToAdd.push(obj);
    });

    return queryToAdd;
  }

  /**
   * Assigne une clé à un objet de manière récursive.
   * @param obj - L'objet cible.
   * @param field - Le champ à assigner.
   * @param value - La valeur à assigner.
   */
  private assignObjectKey(obj: ILooseObject, field: string, value: any): void {
    const keyParts = field.split(this.options.RELATION_DELIMITER);
    let current = obj;

    keyParts.forEach((part, index) => {
      if (index === keyParts.length - 1) {
        current[part] = value;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  }

  private createWhereObject(
    field: string,
    task: string,
    value: string,
    notOperator: boolean,
  ): ILooseObject {
    const obj: ILooseObject = {};
    let condition;

    // Valider la valeur avant de l'utiliser
    if (value === 'NaN' || value === 'undefined' || value === 'null') {
      throw new Error(`Valeur de filtre invalide : ${value}. La valeur doit être un nombre ou une chaîne valide.`);
    }

    switch (task) {
      case this.options.EXACT:
        condition = value;
        break;
      case this.options.CONTAINS:
        condition = Like(`%${value}%`);
        break;
      case this.options.STARTS_WITH:
        condition = Like(`${value}%`);
        break;
      case this.options.ENDS_WITH:
        condition = Like(`%${value}`);
        break;
      case this.options.IS_NULL:
        condition = IsNull();
        break;
      case this.options.LT:
        condition = LessThan(this.parseDateOrNumber(value));
        break;
      case this.options.LTE:
        condition = LessThanOrEqual(this.parseDateOrNumber(value));
        break;
      case this.options.GT:
        condition = MoreThan(this.parseDateOrNumber(value));
        break;
      case this.options.GTE:
        condition = MoreThanOrEqual(this.parseDateOrNumber(value));
        break;
      case this.options.IN:
        condition = In(value.split(this.options.VALUE_DELIMITER));
        break;
      case this.options.BETWEEN:
        const [start, end] = value.split(this.options.VALUE_DELIMITER);
        condition = Between(this.parseDateOrNumber(start), this.parseDateOrNumber(end));
        break;
      default:
        throw new Error(`Tâche de filtrage non supportée : ${task}`);
    }

    if (notOperator) {
      condition = Not(condition);
    }

    this.assignObjectKey(obj, field, condition);
    return obj;
  }

  /**
   * Parse une valeur en date ou en nombre.
   * @param value - La valeur à parser.
   * @returns Une date ou un nombre.
   */
  private parseDateOrNumber(value: string): Date | number {
    // Valider la valeur
    if (value === 'NaN' || value === 'undefined' || value === 'null') {
      throw new Error(`Valeur invalide pour la date ou le nombre : ${value}`);
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (dateRegex.test(value)) return new Date(value);
    if (datetimeRegex.test(value)) return new Date(value);

    const parsedNumber = parseInt(value, 10);
    if (isNaN(parsedNumber)) {
      throw new Error(`Valeur invalide pour la date ou le nombre : ${value}`);
    }

    return parsedNumber;
  }
}