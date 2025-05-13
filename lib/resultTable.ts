import type { IFederatedQueryStatistic, ISummary, ISummaryStatistic } from "./queryAnalysis";

export async function generate_summary_table(summary: ISummary): Promise<string> {
    const file = Bun.file("./template/summary_template.tex");
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

    for(const key of featureKeys){
        const bucketList = summary[key];
        for(const value of bucketList){
            if(value === 0){
                template = template.replace("{}", "-");
            }else{
                template = template.replace("{}", value.toFixed(0));
            }
        }
    }
    return template;
}