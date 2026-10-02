import { PageHead, Section, StatCards, BarChart, DataTable, Mark } from '../../../../../Downloads/exam-centre-merged/exam-centre-main/src/components/ui.jsx';

const MODULES = [
  ['Programming I', 'CMPG211', 108, 89, '97%'],
  ['Mathematics for Engineers', 'MTHS172', 96, 68, '74%'],
  ['Analogue Electronics', 'ELYM215', 84, 79, '88%'],
  ['Data Structures', 'CMPG221', 77, 84, '92%'],
  ['Calculus II', 'MTHS182', 90, 72, '79%'],
];

export default function Analytics() {
  return (
    <>
      <PageHead eyebrow="Class performance" title="Class averages" lead="See how each module and semester is performing across all enrolled students." />
      <StatCards items={[['Overall class average', '81%', 'Across all modules, this semester'], ['Highest performing module', 'CMPG211', '89% average'], ['Needs attention', 'MTHS172', '68% average']]} />
      <Section eyebrow="By module" title="Average mark per module" text="This semester's results, compared side by side.">
        <BarChart data={MODULES.map((m) => [m[1], m[3]])} />
      </Section>
      <Section eyebrow="Over time" title="Class average by semester" text="Tracking whether the overall class average is trending up or down.">
        <BarChart data={[['Sem 1, 2025', 74], ['Sem 2, 2025', 77], ['Sem 1, 2026', 81]]} />
      </Section>
      <Section eyebrow="Breakdown" title="Module averages, this semester">
        <DataTable columns={['Module', 'Module code', 'Students', 'Average', 'Pass rate']}
          rows={MODULES.map(([n, c, s, avg, pass]) => [n, <span className="font-mono">{c}</span>, s, <Mark value={avg} />, pass])} />
      </Section>
    </>
  );
}
