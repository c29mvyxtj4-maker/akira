import { useState } from "react"
import { motion } from "framer-motion"
import { Star, ThumbsUp } from "lucide-react"

const mockReviews = [
  { id: 1, author: "Jane Smith", rating: 5, text: "Excellent app! Transformed our analytics workflow.", helpful: 24, date: "2026-07-10" },
  { id: 2, author: "John Doe", rating: 5, text: "Best analytics platform I've used. Highly recommend!", helpful: 18, date: "2026-07-08" },
  { id: 3, author: "Sarah Johnson", rating: 4, text: "Great features but could use better documentation.", helpful: 12, date: "2026-07-05" },
  { id: 4, author: "Mike Wilson", rating: 4, text: "Solid product. Good support team.", helpful: 8, date: "2026-07-02" },
]

export default function ReviewsPanel() {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  const avgRating = (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1)
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({ rating: r, count: mockReviews.filter(rev => rev.rating === r).length }))

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div className="p-6 rounded-xl bg-surface-2 border border-border text-center">
          <div className="text-4xl font-black text-text-1 mb-2">{avgRating}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "text-amber-500 fill-current" : "text-text-4"}`} />
            ))}
          </div>
          <p className="text-text-4 text-sm">Based on {mockReviews.length} reviews</p>
        </motion.div>

        <motion.div className="md:col-span-2 p-6 rounded-xl bg-surface-2 border border-border space-y-2">
          {ratingCounts.map(rc => (
            <div key={rc.rating} className="flex items-center gap-3">
              <span className="text-text-3 text-sm font-semibold">{rc.rating} ⭐</span>
              <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(rc.count / Math.max(...mockReviews.map(r => r.rating))) * 100}%` }} transition={{ duration: 0.6 }} className="h-full bg-amber-500" />
              </div>
              <span className="text-text-4 text-sm w-8">{rc.count}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div className="p-4 rounded-xl bg-surface-2 border border-border">
        <h3 className="text-text-1 font-bold mb-4">Write a Review</h3>
        <div className="space-y-3">
          <div>
            <p className="text-text-3 text-sm font-semibold mb-2">Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setRating(r)} className="p-2 rounded-lg transition-all">
                  <Star className={`w-6 h-6 ${r <= rating ? "text-amber-500 fill-current" : "text-text-4"}`} />
                </button>
              ))}
            </div>
          </div>

          <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." className="w-full p-3 rounded-lg bg-surface-3 border border-border text-text-1 placeholder-text-4 focus:border-brand-500/50 focus:outline-none resize-none" rows={4} />

          <button className="w-full px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-all">
            Post Review
          </button>
        </div>
      </motion.div>

      <motion.div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-text-1 font-bold">Reviews</h3>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-text-2 text-sm focus:border-brand-500/50 focus:outline-none">
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        {mockReviews.map((rev, idx) => (
          <motion.div key={rev.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-text-1 font-semibold">{rev.author}</p>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "text-amber-500 fill-current" : "text-text-4"}`} />
                  ))}
                  <span className="text-text-4 text-xs ml-1">{rev.date}</span>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-surface-3 text-text-3 hover:bg-surface-4 transition-all flex items-center gap-1 text-xs">
                <ThumbsUp className="w-3 h-3" />
                {rev.helpful}
              </button>
            </div>
            <p className="text-text-3 text-sm">{rev.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
