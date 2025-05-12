import { calculate_statistic, type IQueryStatistic } from "query-stats-sparql";
import type { IQueryData } from "./util";
import { translate } from "sparqlalgebrajs";

export interface IFederatedQueryStatistic extends IQueryStatistic {
    number_federation_member: number;
}

export function analyseQuery(data: Record<string, IQueryData>): Record<string, IFederatedQueryStatistic> {
    const res: Record<string, IFederatedQueryStatistic> = {};

    for (const [key, queryData] of Object.entries(data)) {
        const query = translate(queryData.query);
        const queryStatistic = calculate_statistic(query)
        res[key] = {
            ...queryStatistic,
            number_federation_member: queryData.federatesWith.length
        };
    }

    return res;
}