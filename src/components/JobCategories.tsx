import { ArrowUpRight } from 'lucide-react';

interface JobCategoriesProps {
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { emoji: '🛵', name: 'Delivery', count: '342 open now' },
  { emoji: '💻', name: 'Data Entry', count: '218 open now' },
  { emoji: '🛒', name: 'Retail Assistant', count: '187 open now' },
  { emoji: '🍽️', name: 'Restaurant Helper', count: '154 open now' },
  { emoji: '🎪', name: 'Event Staff', count: '96 open now' },
  { emoji: '📚', name: 'Tutoring', count: '203 open now' },
  { emoji: '🎨', name: 'Freelance Works', count: '491 open now' },
  { emoji: '🌐', name: 'Remote Part-Time', count: '724 open now' },
];

export default function JobCategories({ onSelectCategory }: JobCategoriesProps) {
  const handleClick = (name: string) => {
    onSelectCategory(name);
    const element = document.getElementById('jobs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories" className="py-20 px-4 md:px-12 bg-[#080808]">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#35be35] mb-2">
          Job Categories
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f2f2f2]">
          Every kind of part-time work, all in one place
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleClick(cat.name)}
              className="group p-5 sm:p-6 bg-[#161616] hover:bg-[#1a1a1a] border border-[#222222] hover:border-[#1f6b1f] rounded-2xl transition-all duration-200 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#35be35]/5"
            >
              <div className="text-3xl sm:text-4xl mb-3.5">{cat.emoji}</div>
              <h3 className="font-display text-base font-bold text-[#f2f2f2] group-hover:text-[#5cd65c] transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-[#35be35] font-semibold mt-1">
                {cat.count}
              </p>
              <ArrowUpRight className="w-4 h-4 text-[#555555] group-hover:text-[#5cd65c] absolute top-5 right-5 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
