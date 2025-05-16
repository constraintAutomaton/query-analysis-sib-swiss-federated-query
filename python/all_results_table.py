from latextable import draw_latex, texttable
import json

statsJsonFile = "../results/stat.json"
data = None
outFile = "../results/result.tex"

with open(statsJsonFile, "r") as file:
    data = json.load(file)["data"]

table = texttable.Texttable()
header = [
    "Query",
    "Number of Triple Patterns",
    "Number of OGPs",
    "Number of UGPs",
    "Number of UGPs with Multiple Triple Patterns",
    "Number of Federation Members"
]

table.header(header)
table.set_cols_align(["c", "c", "c", "c", "c", "c"])

for key, value in data.items():
    row = [
        key,
        value["number_triple_patterns"],
        value["number_optional"],
        value["number_union"],
        value["number_union_with_multiple_triple_triple_patterns"],
        value["number_federation_member"]
        ]
    table.add_row(row)

latex_table = draw_latex(table)

with open(outFile, "w") as file:
    file.write(latex_table)