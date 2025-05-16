import type { ISurvey } from "./generateSurvey";
import type { IFederatedQueryStatistic, ISummary, ISummaryStatistic } from "./queryAnalysis";
import { csv2json } from 'json-2-csv';
import type { IQueryData } from "./util";

export async function generate_summary_table(summary: ISummary): Promise<string> {
    const file = Bun.file("./template/summary_template.tex");
    let template = await file.text();
    const featureKeys: (keyof IFederatedQueryStatistic)[] = [
        "number_triple_patterns",
        "number_optional",
        "number_union",
        "number_union_with_multiple_triple_triple_patterns",
        "number_federation_member"
    ];

    const statKeys: (keyof ISummaryStatistic)[] = [
        "avg",
        "max",
        "min",
        "std"
    ];

    for (const featureKey of featureKeys) {
        const stats = summary[featureKey];
        for (const statKey of statKeys) {
            const value = stats[statKey];
            template = template.replace("{}", value.toFixed(2));
        }
    }
    return template;
}

export async function generate_summary_table_bucket(data: Record<string, IFederatedQueryStatistic>): Promise<string> {
    const file = Bun.file("./template/summary_bucket.tex");
    let template = await file.text();
    const featureKeys: (keyof IFederatedQueryStatistic)[] = [
        "number_triple_patterns",
        "number_bgp",
        "number_optional",
        "number_property_path",
        "number_recursive_property_path",
        "number_union",
        "number_distinct",
        "number_limit",
        "number_federation_member"
    ];

    const buckets =
        [
            [0, 0],
            [1, 5],
            [6, 10],
            [11, 15],
            [16, 20],
            [21, 25],
            [26, 30],
            [31, 35]
        ];

    const summary: Record<string, number[]> = Object.fromEntries(
        featureKeys.map((key) => {
            const initialBucket = buckets.map(() => {
                return 0
            });
            return [key, initialBucket];
        })
    )
    for (const stats of Object.values(data)) {
        for (const key of featureKeys) {
            const stat = stats[key];
            for (const [i, range] of buckets.entries()) {
                if (stat >= range[0] && stat <= range[1]) {
                    summary[key][i]++
                    break;
                }
            }
        }
    }

    for (const key of featureKeys) {
        const bucketList = summary[key];
        for (const value of bucketList) {
            if (value === 0) {
                template = template.replace("{}", "-");
            } else {
                template = template.replace("{}", value.toFixed(0));
            }
        }
    }
    return template;
}

export async function generate_table_relevance(data: Record<string, IQueryData>): Promise<string> {
    const templateFile = Bun.file("./template/real_world_relevance.tex");
    let template = await templateFile.text();

    const csvFile = Bun.file("./extra/SIB_survey_Curated.csv");
    const cvsString = await csvFile.text();
    const csvObject = <ISurvey[]>(await csv2json(cvsString));

    const result: Record<string, number> = {
        "Contribution to a Peer-review Paper": 0,
        "Highly Relevant": 0,
        "Relevant": 0,
        "Abstention": 0,
        "Example Query": 0
    };
    let i =0;
    for (const entry of csvObject) {
        const relevance = entry["Real world relevance or background of the query"];
        const id = entry["Query"];
        if(data[id]===undefined){
            console.log(id);
            continue;
        }
        ++i;
        if (relevance === undefined) {
            result["Abstention"]++;
        }else if(relevance === ""){
            result["Abstention"]++;
        }else if(relevance.startsWith("-")){
            result["Abstention"]++;
        }else if (relevance.startsWith("PAPER:")) {
            result["Contribution to a Peer-review Paper"]++;
        } else if (relevance.startsWith("REAL WORLD:")) {
            result["Highly Relevant"]++;
        } else if (relevance.startsWith("TOY:")) {
            result["Example Query"]++;
        } else if (relevance.length > 0) {
            result["Relevant"]++;
        }
    }

    const keys = [
        "Contribution to a Peer-review Paper",
        "Highly Relevant",
        "Relevant",
        "Abstention",
        "Example Query"
    ];

    for (const key of keys) {
        const value = result[key];
        template = template.replace("{}", value.toFixed(0));
    }
    template = template.replace("{}", i.toFixed(0));
    return template;
}
