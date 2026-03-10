import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import './QuizCalendar.css';

const QuizCalendar = ({ quizzes = [], onQuizClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredQuiz, setHoveredQuiz] = useState(null);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getQuizzesForDate = (date) => {
        return quizzes.filter(quiz => {
            const quizStart = new Date(quiz.start_time);
            const quizEnd = new Date(quiz.end_time);
            return (
                date >= new Date(quizStart.getFullYear(), quizStart.getMonth(), quizStart.getDate()) &&
                date <= new Date(quizEnd.getFullYear(), quizEnd.getMonth(), quizEnd.getDate())
            );
        });
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
        const dayNumber = i - startingDayOfWeek + 1;
        if (dayNumber > 0 && dayNumber <= daysInMonth) {
            const date = new Date(year, month, dayNumber);
            const dayQuizzes = getQuizzesForDate(date);
            const isToday = new Date().toDateString() === date.toDateString();

            days.push({
                date: dayNumber,
                fullDate: date,
                quizzes: dayQuizzes,
                isToday
            });
        } else {
            days.push({ date: null });
        }
    }

    return (
        <div className="quiz-calendar">
            <div className="calendar-header">
                <button className="calendar-nav-btn" onClick={previousMonth}>
                    <ChevronLeft size={20} />
                </button>
                <h3 className="calendar-title">
                    <CalendarIcon size={18} />
                    {monthName}
                </h3>
                <button className="calendar-nav-btn" onClick={nextMonth}>
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-header">
                        {day}
                    </div>
                ))}

                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day ${day.date ? 'active' : 'empty'} ${day.isToday ? 'today' : ''} ${day.quizzes?.length > 0 ? 'has-quiz' : ''}`}
                        onMouseEnter={() => day.quizzes?.length > 0 && setHoveredQuiz({ day: day.date, quizzes: day.quizzes })}
                        onMouseLeave={() => setHoveredQuiz(null)}
                    >
                        {day.date && (
                            <>
                                <span className="day-number">{day.date}</span>
                                {day.quizzes?.length > 0 && (
                                    <div className="quiz-indicators">
                                        {day.quizzes.slice(0, 3).map((quiz, idx) => (
                                            <div
                                                key={idx}
                                                className="quiz-dot"
                                                style={{ backgroundColor: getQuizColor(quiz) }}
                                            />
                                        ))}
                                        {day.quizzes.length > 3 && (
                                            <span className="more-quizzes">+{day.quizzes.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                {hoveredQuiz?.day === day.date && (
                                    <div className="quiz-tooltip">
                                        <div className="tooltip-header">
                                            {day.quizzes.length} Quiz{day.quizzes.length > 1 ? 'zes' : ''}
                                        </div>
                                        {day.quizzes.map((quiz, idx) => (
                                            <div
                                                key={idx}
                                                className="tooltip-quiz"
                                                onClick={() => onQuizClick?.(quiz)}
                                            >
                                                <div className="tooltip-quiz-title">{quiz.title}</div>
                                                <div className="tooltip-quiz-meta">
                                                    <span><Clock size={12} /> {quiz.duration_minutes}min</span>
                                                    <span>{quiz.course_name || quiz.course_code}</span>
                                                </div>
                                                <div className="tooltip-quiz-time">
                                                    {new Date(quiz.start_time).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const getQuizColor = (quiz) => {
    // Array of vibrant colors for different quizzes
    const colors = [
        '#6366f1', // indigo
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#f59e0b', // amber
        '#10b981', // emerald
        '#06b6d4', // cyan
        '#f97316', // orange
        '#14b8a6', // teal
        '#a855f7', // purple
        '#3b82f6', // blue
        '#ef4444', // red
        '#84cc16', // lime
    ];

    // Use quiz ID to consistently assign the same color to the same quiz
    const colorIndex = quiz.id % colors.length;
    return colors[colorIndex];
};

export default QuizCalendar;
