import { json2csv, csv2json } from 'json-2-csv';
import { type IQueryData } from './util';
import { writeFile, readFile } from "node:fs/promises";

function generateCsvObject(data: Record<string, IQueryData>): ISurvey[] {
    const entries: ISurvey[] = [];

    for (const [key, value] of Object.entries(data)) {
        const entry: ISurvey = {
            Query: key,
            Description: value.description,
            "Target endpoint": value.target,
            "Federated endpoints": value.federatesWith.join(", "),
            "Real world relevance or background of the query": "",
            'Is this query a toy example?': "",
            'Are there any tricks to make the query executable?': "",
            'Is this query similar to another query?\r': ""
        }
        entries.push(entry);
    }

    return entries;
}

export async function generateCsvSurvey(data: Record<string, IQueryData>, outputFile: string) {
    const csvObject = generateCsvObject(data);
    await writeFile(outputFile, await json2csv(csvObject));
}

export async function appendCsvSurvey(inputFile: string, data: Record<string, IQueryData>, outputFile: string) {
    const prevCsvString = (await readFile(inputFile)).toString();
    const prevCsvObj = <ISurvey[]>(await csv2json(prevCsvString, { delimiter: { wrap: "" } }));

    const newCsvObj = <ISurvey[]>(await generateCsvObject(data));

    const currentCsv: ISurvey[] = JSON.parse(JSON.stringify(newCsvObj));

    for (const entry of prevCsvObj) {
        const index = currentCsv.findIndex(el => el.Query === entry.Query);
        if (index === -1) {
            currentCsv.push(entry)
        }
        if (hasSurveyEntryBeFilled(entry as ISurvey)) {
            currentCsv[index] = entry;
        }
    }
    console.log(JSON.stringify(currentCsv))
    await writeFile(outputFile, await json2csv(currentCsv));
}

function hasSurveyEntryBeFilled(entry: ISurvey): boolean {
    const entryToFill: (keyof ISurvey)[] = [
        "Real world relevance or background of the query",
        'Are there any tricks to make the query executable?',
        'Is this query a toy example?',
        'Is this query similar to another query?\r'
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
    'Is this query a toy example?': string;
    'Are there any tricks to make the query executable?': string;
    'Is this query similar to another query?\r': string
}