import { json2csv } from 'json-2-csv';
import { type IQueryData } from './util';
import { writeFile } from "node:fs/promises";

export async function generateCsvSurvey(data: Record<string, IQueryData>, outputFile: string) {
    const entries: ISurvey[] = [];

    for (const [key, value] of Object.entries(data)) {
        const entry: ISurvey = {
            Query: key,
            Description: value.description,
            "Target endpoint": value.target,
            "Federated endpoints": value.federatesWith.join(", "),
            "Real world relevance or background of the query": "",
            "Is this query a toy example?": "",
            "Is there a Tricks to make the query executable?": "",
            "Is this query similar to another query": ""
        }
        entries.push(entry);
    }
    await writeFile(outputFile, await json2csv(entries));
}

interface ISurvey {
    Query: string;
    Description: string;
    "Target endpoint": string;
    "Federated endpoints": string;
    "Real world relevance or background of the query": string;
    "Is there a Tricks to make the query executable?": string;
    "Is this query a toy example?": string;
    "Is this query similar to another query": string
}