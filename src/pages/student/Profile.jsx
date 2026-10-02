import { PageHead, Section, ProfileCard, ProgressPanel, BarChart, DataTable, Pill } from '../../../../../Downloads/exam-centre-merged/exam-centre-main/src/components/ui.jsx';

export default function Profile() {
  return (
    <>
      <PageHead eyebrow="Student profile" title="Your information & progress" lead="A snapshot of who you are on record and how your academic progress is tracking." />
      <div className="grid gap-4 md:grid-cols-2 mb-10">
        <ProfileCard initials="STU" name="STUDENT" id="STU-224871" details={[
          ['Programme', 'BSc Computer Science & Electronics'], ['Email', '224871@STU.com'],
          ['Enrolled', '2024'], ['Current semester', 'Sem 1, 2026'], ['Status', <Pill>Active</Pill>],
        ]} />
        <ProgressPanel eyebrow="Academic progress" title="Credits & standing" label="Credits completed" value="144 / 360" percent={40}
          note="40% through your degree" stats={[['Overall average', '85%'], ['Modules completed', '18'], ['Modules in progress', '03']]} />
      </div>
      <Section eyebrow="Performance trend" title="Your average per semester" text="A quick look at how your semester average has moved over time.">
        <BarChart data={[['Sem 1, 2025', 68], ['Sem 2, 2025', 74], ['Sem 1, 2026', 85]]} />
      </Section>
      <Section eyebrow="This semester" title="Modules in progress">
        <DataTable columns={['Module', 'Module code', 'Credits', 'Status']} rows={[
          ['Programming I', 'CMPG211', 16, <Pill>In progress</Pill>],
          ['Mathematics for Engineers', 'MTHS172', 16, <Pill>In progress</Pill>],
          ['Analogue Electronics', 'ELYM215', 16, <Pill>In progress</Pill>],
        ]} />
      </Section>
    </>
  );
}
