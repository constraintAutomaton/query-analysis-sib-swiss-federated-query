import { generateCsvSurvey } from './lib/generateSurvey';
import { type IQueryData } from './lib/util';
import { Command } from 'commander';
import { analyseQuery } from './lib/queryAnalysis';
import { generate_summary_table, generate_summary_table_bucket, generate_table_relevance } from './lib/resultTable';


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

const dataFile = Bun.file("./extra/queries.json");

const data: Record<string, IQueryData> = JSON.parse((await dataFile.text())).data;

if (survey_action) {
  const outputSurveyPath = "./results/survey.csv";
  await generateCsvSurvey(data, outputSurveyPath);
}

if (queryAnalysisAction) {
  const outputStatPath = "./results/stat.json";
  const outputSummaryPath = "./results/summary.tex";
  const outputSummaryBucketPath = "./results/summary_bucket.tex";
  const outputRelevance = "./results/relevance.tex";

  const res = analyseQuery(data);

  const jsonRes = JSON.stringify(res, null, 2);
  await Bun.write(outputStatPath, jsonRes);
  
  const summaryTable = await generate_summary_table(res.summary);
  await Bun.write(outputSummaryPath, summaryTable);

  const bucketSummaryTable = await generate_summary_table_bucket(res.data);
  await Bun.write(outputSummaryBucketPath, bucketSummaryTable);

  const tableRelevance = await generate_table_relevance(data);
  await Bun.write(outputRelevance, tableRelevance);
}
