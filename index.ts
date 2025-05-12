import { generateCsvSurvey } from './lib/generateSurvey';
import { readFile } from "node:fs/promises";
import { type IQueryData } from './lib/util';
import { Command } from 'commander';
import { analyseQuery } from './lib/queryAnalysis';


const program = new Command();
program
  .name('query-analysis')
  .version('0.0.0')

  .option('-s, --survey <boolean>', 'generate a surver', false)
  .option('-q, --query-analysis <boolean>', 'analyse the queries', true)
  .parse(process.argv);

const options = program.opts();

const survey_action = options.survey;
const queryAnalysisAction = options.queryAnalysis;

const data: Record<string, IQueryData> = JSON.parse((await readFile("./sib-swiss-federated-query-extractor/sib-swiss-federated-queries.json")).toString()).data;

if (survey_action) {
  const outputSurveyPath = "./results/survey.csv";
  await generateCsvSurvey(data, outputSurveyPath);
}

if (queryAnalysisAction) {
  const outputStatPath = "./results/stat.json";
  const res = analyseQuery(data);
  const jsonRes = JSON.stringify(res, null, 2);
  
  await Bun.write(outputStatPath, jsonRes);
}
