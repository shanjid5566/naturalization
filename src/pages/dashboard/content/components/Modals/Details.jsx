import { X } from 'lucide-react';

export default function Details({ isOpen, onClose, lessonData, }) {
  if (!isOpen) return null;

  // Destructuring lessonData with robust defaults
  const {
    image = "https://www.francechannel.tv/Images/Blog/2024/07/BASTILLEDAY_Image1.jpg", // Default image if none provided
    theme = "France History",
    title = "The Frankish Kingdom",
    subtitle = "Clovis, Charlemagne, and the birth of the French nation",
    sections = [
      // Default section structure (omitted for brevity)
      // ... your default sections array goes here
    ]
  } = lessonData || {};

  // Find the primary button for focusing upon opening (accessibility)
  // The 'Close' button is usually the first element to focus on in a modal
  
  return (
    // 1. Overlay (Backdrop)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center   bg-black/60 px-4"
      // Trap click events on the overlay itself to close the modal
    
    >
      
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all"
        // Prevent click inside the modal from bubbling up and closing the modal via the overlay click
        onClick={(e) => e.stopPropagation()} 
        role="dialog" // ARIA role for accessibility
        aria-modal="true"
        aria-labelledby="lesson-title"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-white ">
          <h2 id="lesson-title" className="text-red-700 text-xl font-extrabold tracking-tight">
            Lesson Details
          </h2>
          <button 
            onClick={onClose }
            className="text-gray-400  transition duration-300 focus:outline-none focus:ring-2  rounded-full p-1"
            aria-label="Close lesson details"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4">

          {/* Image */}
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={image}
              alt={title}
              className="w-full h-80 object-cover transform hover:scale-[1.03] transition duration-500 ease-in-out cursor-pointer"
            />
          </div>
          

          {/* Theme */}
          <p className="text-sm text-red-600 font-semibold uppercase tracking-wider mb-2">
            Theme: {theme}
          </p>

          {/* Title & Subtitle */}
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 text-xl mb-8">{subtitle}</p>

          <hr className="mb-8 border-gray-200" />

          {/* Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{section.heading}</h3>
              {section.paragraphs.map((para, i) => (
                // Used dangerouslySetInnerHTML to correctly render the **Gauls** markdown from default data, 
                // but a better solution would be to process markdown before rendering.
                <p 
                  key={i} 
                  className="text-gray-700 mb-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                ></p>
              ))}
              {section.subSections?.map((sub, i) => (
                <div key={i} className="ml-6 border-l-4 border-red-300 pl-4 py-1">
                  <p className="text-gray-700 italic leading-relaxed">{sub.content}</p>
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}