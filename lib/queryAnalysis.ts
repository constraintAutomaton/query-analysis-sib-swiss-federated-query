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

export function analyseQuery(data: Record<string, IQueryData>): IQueryAnalysis {
    const res: Record<string, IFederatedQueryStatistic> = {};
    const elements: {
        [K in keyof IFederatedQueryStatistic]: number[]
    } = {
        number_triple_patterns: [],
        number_bgp: [],
        number_optional: [],
        number_property_path: [],
        number_recursive_property_path: [],
        number_union_with_multiple_triple_triple_patterns: [],
        number_union: [],
        number_distinct: [],
        number_limit: [],
        number_federation_member: []

    };

    for (const [key, queryData] of Object.entries(data)) {
        const query = translate(queryData.query);
        const queryStatistic = calculate_statistic(query);
        const federation = new Set(queryData.federatesWith);
        const curatedFederation = new Set();
        for(const member of federation){
            curatedFederation.add(member.replace(/\/$/, ""));
        }
        res[key] = {
            ...queryStatistic,
            number_federation_member: curatedFederation.size
        };

        for (const [stat, value] of Object.entries(res[key])) {
            elements[stat as keyof IFederatedQueryStatistic].push(value)
        }
    }
    const summary: Partial<ISummary> = {};

    for (const [key, value] of Object.entries(elements)) {
        const array: number[] = value;
        const sum = array.reduce((acc, current) => {
            return acc + current;
        }, 0);
        const avg = sum / array.length;
        const max = Math.max(...array);
        const min = Math.min(...array);
        const std = (array.reduce((acc, current) => {
            return acc + (current - avg) ** 2
        }, 0) / array.length) ** 0.5;

        summary[key as keyof ISummary] = {
            avg,
            max,
            min,
            std
        };
    }
    return {
        data: res,
        summary: <ISummary>summary
    }
}