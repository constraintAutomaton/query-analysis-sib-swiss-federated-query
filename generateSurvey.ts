import { json2csv, csv2json } from 'json-2-csv';
import { type IQueryData } from './util';
import { writeFile, readFile } from "node:fs/promises";

async function generateCsvObject(data: Record<string, IQueryData>) {
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

    return await json2csv(entries);
}

export async function generateCsvSurvey(data: Record<string, IQueryData>, outputFile: string) {
    const csvObject = await generateCsvObject(data);
    await writeFile(outputFile, csvObject);
}

export async function appendCsvSurvey(inputFile: string, data: Record<string, IQueryData>, outputFile: string) {
    const prevCsvString = (await readFile(inputFile)).toString();
    const prevCsvObj = <ISurvey[]>(await csv2json(prevCsvString));

    const newCsvString = await generateCsvObject(data);
    const newCsvObj = <ISurvey[]>(await csv2json(newCsvString));

    const currentCsv: ISurvey[] = JSON.parse(JSON.stringify(newCsvObj));

    for (const entry of prevCsvObj) {
        if (hasSurveyEntryBeFilled(entry as ISurvey)) {
            const index = currentCsv.findIndex(el => el.Query === entry.Query);
            currentCsv[index] = entry;
        }
    }

    await writeFile(outputFile, await json2csv(currentCsv));
}

function hasSurveyEntryBeFilled(entry: ISurvey): boolean {
    const entryToFill: (keyof ISurvey)[] = [
        "Real world relevance or background of the query",
        "Is there a Tricks to make the query executable?",
        "Is this query a toy example?",
        "Is this query similar to another query"
    ];

    for (const key of entryToFill) {
        if (entry[key] !== "") {
            return true;
        }
    }

    return false;
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