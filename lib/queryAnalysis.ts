import { calculate_statistic, type IQueryStatistic } from "query-stats-sparql";
import type { IQueryData } from "./util";
import { translate } from "sparqlalgebrajs";

export interface IFederatedQueryStatistic extends IQueryStatistic {
    number_federation_member: number;
}

export interface ISummaryStatistic {
    avg: number,
    max: number,
    min: number,
    std: number
}

export type ISummary = {
    [K in keyof IFederatedQueryStatistic]: ISummaryStatistic
}

export interface IQueryAnalysis {
    data: Record<string, IFederatedQueryStatistic>;
    summary: ISummary;
}

export function analyseQuery(data: Record<string, IQueryData>): Record<string, IFederatedQueryStatistic> {
    const res: Record<string, IFederatedQueryStatistic> = {};
    const elements: {
        [K in keyof IFederatedQueryStatistic]: number[]
    } = {
        number_triple_patterns: [],
        number_bgp: [],
        number_optional: [],
        number_property_path: [],
        number_recursive_property_path: [],
        number_union: [],
        number_distinct: [],
        number_limit: [],
        number_federation_member: []

    };

    for (const [key, queryData] of Object.entries(data)) {
        const query = translate(queryData.query);
        const queryStatistic = calculate_statistic(query);
        res[key] = {
            ...queryStatistic,
            number_federation_member: queryData.federatesWith.length
        };

        for (const [key, value] of Object.entries(queryStatistic)) {
            elements[key as keyof IFederatedQueryStatistic ].push(value)
        }
    }
    const summary: Partial<ISummary> = {};

    return res;
}