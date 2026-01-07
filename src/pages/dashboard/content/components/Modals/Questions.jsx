import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../../../../api/axiosInstance';

const Questions = ({ activeTab, handleCreateTheme, onClose, themes = [], lessons = [], refetchQuestions }) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [lessonOptions, setLessonOptions] = useState(lessons || []);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOptionChange = (index, value) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!questionText.trim()) return toast.error('Please enter a question');
    if (!selectedTheme) return toast.error('Please select a theme');

    setIsSaving(true);
    try {
      const payload = {
        name: questionText,
        lesson_id: selectedLesson || undefined,
        difficulty,
        course_id: selectedTheme,
        options: options.filter((o) => o && o.trim()),
        correct_answer: correctAnswer,
      };

      let res;
      if (file) {
        const formData = new FormData();
        // append fields
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined) return;
          if (Array.isArray(v)) formData.append(k, JSON.stringify(v));
          else formData.append(k, v);
        });
        // append image under `image` (backend may expect `image` or `image_url`)
        formData.append('image', file);

        res = await api.post('/questions/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/questions/', payload);
      }

      toast.success(res?.data?.message || 'Question created successfully');

      // refetch questions list in parent
      try {
        if (typeof refetchQuestions === 'function') await refetchQuestions();
      } catch (e) {
        console.warn('Refetch questions failed:', e);
      }

      // reset
      setQuestionText('');
      setSelectedTheme('');
      setSelectedLesson('');
      setDifficulty('Medium');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setFile(null);

      onClose && onClose();
    } catch (err) {
      console.error('Error creating question:', err?.response?.data || err);
      const message = err?.response?.data?.message || 'Failed to create question';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch lessons when a theme (course) is selected
  useEffect(() => {
    if (!selectedTheme) {
      setLessonOptions(lessons || []);
      return;
    }

    const fetchLessons = async () => {
      setLessonsLoading(true);
      try {
        // backend expects GET to this endpoint with course id in path
        const res = await api.get(`/dashboard/lesson/by_course_id/${selectedTheme}`);

        // Normalize array locations
        let dataArray = [];
        if (res && Array.isArray(res.data)) {
          dataArray = res.data;
        } else if (res && res.data) {
          if (Array.isArray(res.data.data)) dataArray = res.data.data;
          else if (Array.isArray(res.data.items)) dataArray = res.data.items;
          else if (Array.isArray(res.data.results)) dataArray = res.data.results;
        }

        // Set lesson options (we show lesson names per the API response)
        setLessonOptions(dataArray || []);
      } catch (err) {
        console.error('Failed to fetch lessons by course id', err?.response || err);
        toast.error('Failed to load lessons for selected theme');
        setLessonOptions([]);
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLessons();
  }, [selectedTheme]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose && onClose();
      }}
    >


      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl sm:max-w-md md:max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header - fixed */}
        <div className="p-6 border-b border-gray-200 relative flex-shrink-0">
          <h2 className="text-2xl font-bold text-[#5F0006]">{`Add ${activeTab}`}</h2>
          <p className="text-sm text-[#F18A91] mt-1">Add or update question details and answers</p>

          <button onClick={() => onClose && onClose()} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-2xl leading-none transition duration-150">
            &times;
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="p-6 space-y-5 bg-[#FFFFFF] overflow-y-auto" style={{ maxHeight: 'calc(90vh - 170px)' }}>

          {/* Question Text Area */}
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-[#5F0006] mb-1">Question</label>
            <textarea
              id="question"
              rows="4"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your questions here."
              className="w-full px-4 py-2 border border-[#F18A91] rounded-lg text-sm text-[#5F0006] resize-none focus:outline-none focus:ring-2 focus:ring-[#F18A91] focus:border-[#F18A91] transition duration-150"
            ></textarea>
          </div>

          {/* Theme and Difficulty (Responsive Grid: 1 column on small, 2 on others) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div >
              <label htmlFor="theme" className="block text-sm font-medium text-[#5F0006] mb-1">Theme</label>
              <div className="relative">
                <select
                  id="theme"
                  value={selectedTheme}
                  onChange={(e) => {
                    setSelectedTheme(e.target.value);
                    setSelectedLesson('');
                  }}
                  className="appearance-none w-full px-4 py-3 border border-[#F18A91] rounded-lg text-sm text-[#5F0006] pr-10 focus:outline-none focus:ring-2 focus:ring-[#F18A91] focus:border-[#fc7f87] transition duration-150"
                >
                  <option value="">Select Theme</option>
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#F18A91]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-[#5F0006] mb-1">Difficulty</label>
              <div className="relative">
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="appearance-none w-full px-4 py-3 border border-[#F18A91] rounded-lg text-sm text-[#5F0006] bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                >
                  <option value="ease">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="difficult">Difficult</option>
                  <option value="most_difficult">Most Difficult</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Name Dropdown */}
          <div>
            <label htmlFor="lessonName" className="block text-sm font-medium text-[#5F0006] mb-1">Lesson Name</label>
            <div className="relative">
              <select
                id="lessonName"
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="appearance-none w-full px-4 py-3 border border-[#F18A91] rounded-lg text-sm text-[#5F0006] bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-[#F18A91] focus:border-[#F18A91] transition duration-150"
              >
                <option value="">Select Lesson Name</option>
                {lessonsLoading ? (
                  <option value="">Loading lessons...</option>
                ) : (
                  lessonOptions.length > 0 ? (
                    lessonOptions.map((l, idx) => (
                      
                      <option key={`${ l.id || idx}`} value={l.id}>{l.LessonName || l.name || `Lesson ${idx + 1}`}</option>
                    ))
                  ) : (
                    <option value="">Select Lesson Name</option>
                  )
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#5F0006]">Answer Options</h3>
            {options.map((opt, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Answer Option ${index + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-4 py-3 border border-[#F18A91] rounded-lg text-sm text-[#5F0006] focus:outline-none focus:ring-2 focus:ring-[#F18A91] focus:border-[#F18A91] transition duration-150"
              />
            ))}
          </div>

          {/* Correct Answer */}
          <div>
            <h3 className="text-sm font-semibold text-[#5F0006]">Correct Answer</h3>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="e.g., Answer Option 2"
              className="w-full px-4 py-3 border border-[#F18A91] rounded-lg text-sm text-[#5F0006] focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] transition duration-150"
            />
          </div>

          {/* Upload Image Field (Optional) */}
          <div>
            <h3 className="text-sm font-semibold text-[#5F0006] mb-2">Upload Image (Optional)</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
                {file && <div className="mt-2 text-sm text-gray-700">Selected file: <span className="font-medium">{file.name}</span></div>}
              </div>
            </div>
          </div>

        </div>

        {/* Footer - sticky */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
          <button onClick={() => onClose && onClose()} className="w-[102px] h-[35px] px-3 py-2 gap-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSaving} className="w-[130px] h-[40px] gap-1 text-sm font-medium text-white bg-gradient-to-r from-[#E1000F] to-[#3333A7] rounded transition-colors hover:from-[#7C0008] hover:to-blue-700 shadow-sm">
            {isSaving ? 'Saving...' : 'Save Question'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Questions;