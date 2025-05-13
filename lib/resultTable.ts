import type { IFederatedQueryStatistic, ISummary, ISummaryStatistic } from "./queryAnalysis";

export async function generate_summary_table(summary: ISummary):Promise<string>{
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

    const statKeys: (keyof ISummaryStatistic)[]=[
        "avg",
        "max",
        "min",
        "std"
    ];

    for(const featureKey of featureKeys){
        const stats = summary[featureKey];
        for(const statKey of statKeys){
            const value = stats[statKey];
            template = template.replace("{}", value.toFixed(2));
        }
    }
    return template;
}