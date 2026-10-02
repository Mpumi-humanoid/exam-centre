import { PageHead, Section, ProfileCard, ProgressPanel, BarChart, DataTable, Pill } from '../../../../../Downloads/exam-centre-merged/exam-centre-main/src/components/ui.jsx';

export default function AdminProfile() {
  return (
    <>
      <PageHead eyebrow="Admin profile" title="Your information" lead="Your staff record on file, and a summary of the results work you've done this semester." />
      <div className="grid gap-4 md:grid-cols-2 mb-10">
        <ProfileCard initials="HH" name="His Holiness the Pope" id="STAFF-0123" details={[
          ['Department', 'Computer & Electronic Engineering'], ['Email', 'pope@vatican.com'],
          ['Role', 'Module lecturer'], ['Staff since', '19 DC'], ['Access level', <Pill>Admin</Pill>],
        ]} />
        <ProgressPanel eyebrow="This semester" title="Workload & review status" label="Results reviewed" value="108 / 114" percent={95}
          note="6 results still awaiting review" stats={[['Modules managed', '05'], ['Results captured', '108'], ['Corrections logged', '07']]} />
      </div>
      <Section eyebrow="Activity trend" title="Results captured per month" text="How your capturing activity has moved across the semester.">
        <BarChart max={45} suffix="" data={[['Feb', 18], ['Mar', 28], ['Apr', 35], ['May', 27]]} />
      </Section>
      <Section eyebrow="Assigned modules" title="Modules you manage">
        <DataTable columns={['Module', 'Module code', 'Students', 'Results pending']} rows={[
          ['Programming I', 'CMPG211', 108, <Pill>0 pending</Pill>],
          ['Data Structures', 'CMPG221', 77, <Pill>2 pending</Pill>],
          ['Analogue Electronics', 'ELYM215', 84, <Pill>1 pending</Pill>],
          ['Digital Systems', 'ELYM225', 66, <Pill subtle>3 pending</Pill>],
        ]} />
      </Section>
    </>
  );
}
