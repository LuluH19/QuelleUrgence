function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
      <details className="group">
        <summary 
          className="flex justify-between items-center cursor-pointer p-2 text-sm md:text-lg lg:text-xl font-bold text-white outline-none list-none bg-primary rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          aria-label={`Question : ${question}`}
        >
          {question}
          <span className="text-2xl group-open:rotate-180 transition-transform" aria-hidden="true">
            <svg className="w-6 h-6" fill="none" stroke="#fff" strokeWidth={4} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </summary>
        <div className="bg-white px-4 pt-3 pb-6 text-black" role="region" aria-label="Réponse">
          <p>{answer}</p>
        </div>
      </details>
    )
}

export default FAQItem;