import { Op } from "sequelize";

export function encodeCursor(cursor) {
    return cursor ? Buffer.from(JSON.stringify(cursor)).toString("base64") : null;
}

export function decodeCursor(cursor) {
    return cursor ? JSON.parse(Buffer.from(cursor, "base64").toString("utf8")) : null;
}

export function getPaginationQuery(cursor, cursorOrderOperator, paginationField, primaryKeyField) {
    if (paginationField !== primaryKeyField) {
        return {
            [Op.or]: [
                {
                    [paginationField]: {
                        [cursorOrderOperator]: cursor[0]
                    }
                },
                {
                    [paginationField]: cursor[0],
                    [primaryKeyField]: {
                        [cursorOrderOperator]: cursor[1]
                    }
                }
            ]
        };
    } else {
        return {
            [paginationField]: {
                [cursorOrderOperator]: cursor[0]
            }
        };
    }
}

export function withPagination({ methodName = "paginate", primaryKeyField = "id" } = {}) {
    return model => {
        const paginate = async ({
            where = false,
            attributes = [],
            include = [],
            scopes = [],
            limit,
            before,
            after,
            desc = false,
            paginationField = primaryKeyField,
            withTotal = false
        }) => {
            const decodedBefore = !!before ? decodeCursor(before) : null;
            const decodedAfter = !!after ? decodeCursor(after) : null;
            const cursorOrderIsDesc = before ? !desc : desc;
            const cursorOrderOperator = cursorOrderIsDesc ? Op.lt : Op.gt;
            const paginationFieldIsNonId = paginationField !== primaryKeyField;

            let paginationQuery;

            if (before) {
                paginationQuery = getPaginationQuery(decodedBefore, cursorOrderOperator, paginationField, primaryKeyField);
            } else if (after) {
                paginationQuery = getPaginationQuery(decodedAfter, cursorOrderOperator, paginationField, primaryKeyField);
            }

            const whereQuery = paginationQuery ? { [Op.and]: [paginationQuery, where] } : where;

            const parameters = {
                ...(whereQuery ? { where: whereQuery } : {}),
                limit: limit + 1,
                include: [],
                order: [
                    cursorOrderIsDesc ? [paginationField, "DESC"] : paginationField,
                    ...(paginationFieldIsNonId ? [primaryKeyField] : [])
                ],
                ...(Array.isArray(attributes) && attributes.length ? { attributes } : {})
            };

            if (include && include.length > 0) {
                parameters.include = include;
            }

            let total = {};
            let results;
            if (withTotal) {
                const { count, rows } = await model.scope(scopes).findAndCountAll(parameters);
                total = { total: count };
                results = rows;
            } else {
                results = await model.scope(scopes).findAll(parameters);
            }

            const hasMore = results.length > limit;

            if (hasMore) {
                results.pop();
            }

            if (before) {
                results.reverse();
            }

            const hasNext = !!before || hasMore;
            const hasPrevious = !!after || (!!before && hasMore);

            let beforeCursor = null;
            let afterCursor = null;
            let beforeAfter = {};

            if (results.length > 0) {
                beforeCursor = paginationFieldIsNonId
                    ? encodeCursor([results[0][paginationField], results[0][primaryKeyField]])
                    : encodeCursor([results[0][paginationField]]);

                afterCursor = paginationFieldIsNonId
                    ? encodeCursor([results[results.length - 1][paginationField], results[results.length - 1][primaryKeyField]])
                    : encodeCursor([results[results.length - 1][paginationField]]);

                beforeAfter = {
                    before: beforeCursor,
                    after: afterCursor
                };
            }

            return {
                results,
                cursors: {
                    hasNext,
                    hasPrevious,
                    ...beforeAfter,
                    ...total
                }
            };
        };

        model[methodName] = paginate;
    };
}
