import React, { useState } from 'react';
import { X, Star, MessageSquare, Send, ThumbsUp, AlertCircle, CheckCircle2, ShieldCheck, Reply, Trash2, Edit2, CornerDownRight } from 'lucide-react';
import { MenuItem, ItemReview, User } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  reviews: ItemReview[];
  currentUser: User | null;
  onSubmitReview: (review: Omit<ItemReview, 'id' | 'createdAt'>) => void;
  onOpenLogin: () => void;
  onReplyReview?: (reviewId: number, replyText: string) => void;
  onDeleteReplyReview?: (reviewId: number) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  item,
  reviews,
  currentUser,
  onSubmitReview,
  onOpenLogin,
  onReplyReview,
  onDeleteReplyReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);

  // Admin inline replying state
  const [replyingToReviewId, setReplyingToReviewId] = useState<number | null>(null);
  const [replyInputText, setReplyInputText] = useState<string>('');

  if (!isOpen || !item) return null;

  const itemReviews = reviews.filter((r) => r.itemId === item.id);
  const avgRating = itemReviews.length
    ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Vui lòng nhập lời nhận xét hoặc góp ý về món ăn.');
      return;
    }

    onSubmitReview({
      itemId: item.id,
      userId: currentUser.id,
      userName: currentUser.fullName,
      rating,
      comment: comment.trim(),
    });

    setComment('');
    setRating(5);
    setErrorMsg(null);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-bg-card w-full max-w-xl rounded-2xl shadow-2xl border border-border-base overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-base flex items-center justify-between bg-bg-primary">
          <div className="flex items-center gap-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-12 h-12 rounded-xl object-cover bg-bg-input border border-border-base shadow-2xs"
            />
            <div>
              <h2 className="text-base font-bold text-text-primary font-serif leading-snug">{item.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
                <span className="text-[#E8B84B] font-bold">{item.price.toLocaleString('vi-VN')}₫</span>
                <span>•</span>
                {avgRating ? (
                  <span className="flex items-center gap-1 font-bold text-[#E8B84B]">
                    <Star className="w-3.5 h-3.5 fill-[#E8B84B] text-[#E8B84B]" />
                    <span>{avgRating} / 5 ({itemReviews.length} đánh giá)</span>
                  </span>
                ) : (
                  <span>Chưa có đánh giá nào</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-input flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Submission Form for logged in users */}
          <div className="bg-bg-input rounded-xl p-4 border border-[#E8B84B]/30">
            <h3 className="font-bold text-text-primary text-sm mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#E8B84B]" />
              <span>Gửi đánh giá & nhận xét của bạn</span>
            </h3>

            {!currentUser ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-text-secondary">
                  Bạn cần đăng nhập tài khoản khách hàng để nhận xét món ăn này.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs shadow-xs cursor-pointer"
                >
                  Đăng nhập để đánh giá
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-text-secondary font-semibold mb-1">
                    Đánh giá sao:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-border-base hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating || rating) >= star
                              ? 'fill-[#E8B84B] text-[#E8B84B]'
                              : 'text-border-base'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-[#E8B84B]">
                      {rating === 5 ? 'Tuyệt hảo (5/5)' : rating === 4 ? 'Rất ngon (4/5)' : rating === 3 ? 'Bình thường (3/5)' : rating === 2 ? 'Cần cải thiện (2/5)' : 'Không hài lòng (1/5)'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary font-semibold mb-1">
                    Nhận xét chi tiết:
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Món ăn có vừa vị không? Độ giòn, nước sốt hay lượng cơm thế nào?..."
                    className="w-full px-3 py-2 rounded-xl border border-border-base bg-bg-card text-text-primary focus:outline-none focus:border-[#E8B84B] text-xs placeholder-slate-500"
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successNotice && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cảm ơn bạn! Đánh giá của bạn đã được ghi nhận.</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold flex items-center gap-1.5 shadow-md shadow-[#E8B84B]/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi nhận xét</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* List of existing reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-text-primary text-sm">
                Đánh giá từ thực khách ({itemReviews.length})
              </h3>
              {avgRating && (
                <span className="text-text-secondary">
                  Trung bình: <strong className="text-[#E8B84B]">{avgRating}★</strong>
                </span>
              )}
            </div>

            {itemReviews.length === 0 ? (
              <div className="text-center py-6 bg-bg-card rounded-xl border border-dashed border-border-base text-text-secondary">
                <ThumbsUp className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-[#E8B84B]" />
                <p className="font-medium text-xs text-text-primary">Chưa có nhận xét nào cho món này.</p>
                <p className="text-[11px] text-text-secondary mt-0.5">Hãy là người đầu tiên thưởng thức và chia sẻ trải nghiệm!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {itemReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl border border-border-base bg-bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/30 font-extrabold text-[10px] flex items-center justify-center">
                          {rev.userName.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-bold text-text-primary">{rev.userName}</span>
                      </div>
                      <span className="text-[10px] text-text-secondary">{rev.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            rev.rating >= s ? 'fill-[#E8B84B] text-[#E8B84B]' : 'text-border-base'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-text-secondary leading-relaxed text-xs">
                      {rev.comment}
                    </p>

                    {/* Official Admin Reply display */}
                    {rev.adminReply && (
                      <div className="mt-2.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1 relative">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 font-bold text-purple-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{rev.adminReply.repliedBy || 'Ban Quản Trị Canteen'}</span>
                            <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider border border-purple-500/30">
                              Quản trị viên
                            </span>
                          </div>
                          <span className="text-[10px] text-purple-300/70 font-medium">
                            {rev.adminReply.repliedAt}
                          </span>
                        </div>
                        <p className="text-text-primary font-medium leading-relaxed pl-5 border-l-2 border-purple-500/50">
                          {rev.adminReply.comment}
                        </p>

                        {currentUser?.role === 'ADMIN' && (
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToReviewId(rev.id);
                                setReplyInputText(rev.adminReply?.comment || '');
                              }}
                              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Sửa phản hồi</span>
                            </button>
                            {onDeleteReplyReview && (
                              <button
                                type="button"
                                onClick={() => onDeleteReplyReview(rev.id)}
                                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Reply Action & Inline Form */}
                    {currentUser?.role === 'ADMIN' && (
                      <div className="pt-1">
                        {replyingToReviewId !== rev.id ? (
                          !rev.adminReply && (
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToReviewId(rev.id);
                                setReplyInputText('');
                              }}
                              className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-purple-950/50 border border-purple-500/30 transition-colors cursor-pointer"
                            >
                              <Reply className="w-3.5 h-3.5" />
                              <span>Phản hồi với tư cách Admin</span>
                            </button>
                          )
                        ) : (
                          <div className="p-3 bg-bg-card rounded-xl border border-purple-500/40 shadow-sm space-y-2 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                                <CornerDownRight className="w-3.5 h-3.5 text-purple-400" />
                                <span>Nhập nội dung phản hồi đánh giá của {rev.userName}:</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setReplyingToReviewId(null)}
                                className="text-text-secondary hover:text-text-primary"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={replyInputText}
                              onChange={(e) => setReplyInputText(e.target.value)}
                              placeholder="Cảm ơn quý khách đã gửi đánh giá, Canteen xin tiếp thu..."
                              className="w-full text-xs p-2.5 rounded-lg border border-border-base focus:outline-none focus:border-[#E8B84B] bg-bg-input text-text-primary"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToReviewId(null)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!replyInputText.trim()) return;
                                  if (onReplyReview) {
                                    onReplyReview(rev.id, replyInputText.trim());
                                  }
                                  setReplyingToReviewId(null);
                                  setReplyInputText('');
                                }}
                                disabled={!replyInputText.trim()}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-[#E8B84B] hover:bg-[#F4C95D] text-black flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Gửi phản hồi</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border-base bg-bg-primary flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-bg-elevated hover:bg-bg-hover text-text-primary font-bold text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
