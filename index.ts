import { generateCsvSurvey } from './generateSurvey';
import { readFile } from "node:fs/promises";
import { type IQueryData } from './util';

const data: Record<string, IQueryData> = JSON.parse((await readFile("./sib-swiss-federated-query-extractor/sib-swiss-federated-queries.json")).toString()).data;
const outputSurveyPath = "./results/survey.csv";

await generateCsvSurvey(data, outputSurveyPath);
