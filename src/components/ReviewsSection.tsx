export default function ReviewsSection() {
  const reviews = [
    {
      stars: '★★★★★',
      text: 'I made ₹18,000 last month doing delivery shifts on weekends and evenings in Chennai. The app showed me jobs within walking distance and I got paid directly to UPI the next day.',
      avatar: '👨🏽',
      name: 'Ravi Kumar',
      role: 'Delivery Worker · Chennai',
    },
    {
      stars: '★★★★★',
      text: 'As a restaurant owner in Bangalore, finding reliable weekend staff used to take days. With Money Maker I post a work and have three confirmed workers by next morning.',
      avatar: '👩🏽',
      name: 'Priya Nair',
      role: 'Restaurant Owner · Bangalore',
    },
    {
      stars: '★★★★★',
      text: "I'm a college student in Vellore. The Class 10 Math tutoring jobs fit perfectly around my classes and the AI match found me nearby students with top hourly rates.",
      avatar: '🧑🏽',
      name: 'Arjun Krishnan',
      role: 'Tutor & Student · Vellore',
    },
  ];

  return (
    <section className="py-20 px-4 md:px-12 bg-[#080808]">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#35be35] mb-2">
          Verified Reviews
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f2f2f2]">
          Trusted by workers and employers across India
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="p-6 bg-[#161616] border border-[#222222] rounded-2xl flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="text-[#35be35] text-sm tracking-wider mb-3">
                  {r.stars}
                </div>
                <p className="text-xs sm:text-sm text-[#999999] leading-relaxed mb-6">
                  "{r.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#222222]">
                <div className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center text-lg">
                  {r.avatar}
                </div>
                <div>
                  <h5 className="font-display text-xs font-bold text-[#f2f2f2]">{r.name}</h5>
                  <p className="text-[11px] text-[#555555]">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
