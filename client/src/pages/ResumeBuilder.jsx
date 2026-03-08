import React, { useState, useRef } from 'react';
import { Download, Plus, Trash2, Edit3, LayoutTemplate, Briefcase } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import PageWrapper from '../components/PageWrapper';

const ResumeBuilder = () => {
  const resumeRef = useRef();

  const [personal, setPersonal] = useState({
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'A passionate software engineer with a knack for building scalable web applications.'
  });

  const [experience, setExperience] = useState([
    { id: 1, company: 'Tech Corp', role: 'Frontend Developer', maxDate: '2021 - Present', desc: 'Developed modern interfaces using React and Tailwind CSS.' }
  ]);

  const [education, setEducation] = useState([
    { id: 1, school: 'State University', degree: 'B.S. Computer Science', maxDate: '2017 - 2021' }
  ]);

  const [skills, setSkills] = useState('React, JavaScript, Tailwind, Node.js, Git');

  const handleExportPDF = () => {
    const element = resumeRef.current;

    // Set up html2pdf options specifically for a standard US Letter resume format
    const opt = {
      margin: 10, // 10mm margin
      filename: `${personal.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const addExp = () => setExperience([...experience, { id: Date.now(), company: '', role: '', maxDate: '', desc: '' }]);
  const removeExp = (id) => setExperience(experience.filter(e => e.id !== id));

  const addEdu = () => setEducation([...education, { id: Date.now(), school: '', degree: '', maxDate: '' }]);
  const removeEdu = (id) => setEducation(education.filter(e => e.id !== id));

  return (
    <PageWrapper className="max-w-7xl mx-auto space-y-8 pb-8 flex flex-col lg:flex-row gap-6">

      {/* Left Column: Form Controls */}
      <div className="flex-1 space-y-6 overflow-y-auto max-h-[85vh] pr-4 no-scrollbar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <LayoutTemplate className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Builder</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Edit fields to build your live preview</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border space-y-4">
          <h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><Edit3 size={18} /> Personal Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" value={personal.name} onChange={e => setPersonal({ ...personal, name: e.target.value })} className="col-span-2 md:col-span-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />
            <input type="text" placeholder="Job Title" value={personal.title} onChange={e => setPersonal({ ...personal, title: e.target.value })} className="col-span-2 md:col-span-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />
            <input type="email" placeholder="Email" value={personal.email} onChange={e => setPersonal({ ...personal, email: e.target.value })} className="col-span-2 md:col-span-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />
            <input type="text" placeholder="Phone" value={personal.phone} onChange={e => setPersonal({ ...personal, phone: e.target.value })} className="col-span-2 md:col-span-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />
            <input type="text" placeholder="Location" value={personal.location} onChange={e => setPersonal({ ...personal, location: e.target.value })} className="col-span-full p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />
            <textarea placeholder="Professional Summary" value={personal.summary} onChange={e => setPersonal({ ...personal, summary: e.target.value })} className="col-span-full p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full h-24 resize-none" />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><Briefcase size={18} /> Experience</h2>
            <button onClick={addExp} className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-transform duration-200 hover:scale-[1.03] active:scale-95"><Plus size={16} /> Add Role</button>
          </div>
          {experience.map((exp, idx) => (
            <div key={exp.id} className="p-4 border dark:border-gray-700 rounded-xl space-y-3 relative group">
              <button onClick={() => removeExp(exp.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
              <input type="text" placeholder="Company" value={exp.company} onChange={e => {
                const newExp = [...experience]; newExp[idx].company = e.target.value; setExperience(newExp);
              }} className="w-full p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Role Label" value={exp.role} onChange={e => {
                  const newExp = [...experience]; newExp[idx].role = e.target.value; setExperience(newExp);
                }} className="p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                <input type="text" placeholder="Date (e.g. 2020-Present)" value={exp.maxDate} onChange={e => {
                  const newExp = [...experience]; newExp[idx].maxDate = e.target.value; setExperience(newExp);
                }} className="p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>
              <textarea placeholder="Description" value={exp.desc} onChange={e => {
                const newExp = [...experience]; newExp[idx].desc = e.target.value; setExperience(newExp);
              }} className="w-full p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white h-20 resize-none" />
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">Education</h2>
            <button onClick={addEdu} className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-transform duration-200 hover:scale-[1.03] active:scale-95"><Plus size={16} /> Add School</button>
          </div>
          {education.map((edu, idx) => (
            <div key={edu.id} className="p-4 border dark:border-gray-700 rounded-xl space-y-3 relative group">
              <button onClick={() => removeEdu(edu.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
              <input type="text" placeholder="School" value={edu.school} onChange={e => {
                const newEdu = [...education]; newEdu[idx].school = e.target.value; setEducation(newEdu);
              }} className="w-full p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Degree" value={edu.degree} onChange={e => {
                  const newEdu = [...education]; newEdu[idx].degree = e.target.value; setEducation(newEdu);
                }} className="p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                <input type="text" placeholder="Date (e.g. 2017-2021)" value={edu.maxDate} onChange={e => {
                  const newEdu = [...education]; newEdu[idx].maxDate = e.target.value; setEducation(newEdu);
                }} className="p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border space-y-4">
          <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">Skills</h2>
          <textarea placeholder="Comma separated skills (e.g. React, Node.js)" value={skills} onChange={e => setSkills(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white h-20 resize-none" />
        </div>

      </div>

      {/* Right Column: Live A4 Preview & Export */}
      <div className="flex-1 flex flex-col pt-4 lg:pt-0">
        <div className="flex justify-end mb-4">
          <button onClick={handleExportPDF} className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 flex items-center gap-2 shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-95">
            <Download size={18} /> Export PDF
          </button>
        </div>

        {/* Render Preview */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-8 rounded-2xl overflow-x-auto flex justify-center items-start shadow-inner">
          {/* PDF Container Wrapper */}
          <div className="bg-white text-black shadow-xl" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Actual content passed to html2pdf */}
            <div ref={resumeRef} className="p-10 font-sans" style={{ boxSizing: 'border-box' }}>

              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-[#2c3e50]">{personal.name || 'Your Name'}</h1>
                <h2 className="text-xl text-gray-600 mt-1">{personal.title || 'Your Title'}</h2>
                <div className="flex justify-center items-center gap-4 text-sm text-gray-500 mt-3">
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <span>• {personal.phone}</span>}
                  {personal.location && <span>• {personal.location}</span>}
                </div>
              </div>

              {/* Summary */}
              {personal.summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-[#2c3e50] border-b border-gray-200 mb-2">Summary</h3>
                  <p className="text-sm leading-relaxed text-gray-800">{personal.summary}</p>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-[#2c3e50] border-b border-gray-200 mb-3">Experience</h3>
                  <div className="space-y-4">
                    {experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-[#34495e]">{exp.company || 'Company Name'}</h4>
                          <span className="text-xs font-semibold text-gray-500">{exp.maxDate || 'Date'}</span>
                        </div>
                        <div className="italic text-sm text-gray-600 mb-1">{exp.role || 'Role'}</div>
                        {exp.desc && <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{exp.desc}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-[#2c3e50] border-b border-gray-200 mb-3">Education</h3>
                  <div className="space-y-3">
                    {education.map(edu => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <div>
                          <h4 className="font-bold text-[#34495e]">{edu.school || 'School Name'}</h4>
                          <div className="text-sm text-gray-600">{edu.degree || 'Degree'}</div>
                        </div>
                        <span className="text-xs font-semibold text-gray-500">{edu.maxDate || 'Date'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold uppercase tracking-wider text-[#2c3e50] border-b border-gray-200 mb-3">Skills</h3>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">
                    {skills.split(',').map(s => s.trim()).filter(Boolean).join(' • ')}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

    </PageWrapper>
  );
};

export default ResumeBuilder;
