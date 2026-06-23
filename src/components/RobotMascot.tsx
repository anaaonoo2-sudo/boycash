import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bodyImg from '../assets/robot-parts/robot_body_left3q.png';
import headImg from '../assets/robot-parts/robot_head_front.png';
import armLeftImg from '../assets/robot-parts/robot_arm_left.png';
import armRightImg from '../assets/robot-parts/robot_arm_right.png';
import { askAssistant } from '../services/aiService';

interface RobotMascotProps {
  /** اختياري: رسالة تظهر بفقاعة الشات مباشرة بدون انتظار رد الذكاء الاصطناعي */
  initialMessage?: string;
}

const RobotMascot: React.FC<RobotMascotProps> = ({ initialMessage }) => {
  const [isThinking, setIsThinking] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(initialMessage ?? null);
  const [isExcited, setIsExcited] = useState(false);

  // حركة الترحيب التلقائية عند أول تحميل
  useEffect(() => {
    const t = setTimeout(() => setIsExcited(true), 600);
    const t2 = setTimeout(() => setIsExcited(false), 1800);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  const handleTap = useCallback(async () => {
    setIsExcited(true);
    setIsThinking(true);
    setBubbleText(null);
    try {
      const reply = await askAssistant('مرحباً! ساعدني بسرعة بجملة قصيرة جداً.');
      setBubbleText(reply);
    } catch {
      setBubbleText('أنا هنا لمساعدتك! 🤖');
    } finally {
      setIsThinking(false);
      setTimeout(() => setIsExcited(false), 1200);
    }
  }, []);

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'relative',
        width: 140,
        height: 230,
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'manipulation',
      }}
    >
      {/* فقاعة المحادثة */}
      <AnimatePresence>
        {(bubbleText || isThinking) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: '105%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ffffff',
              borderRadius: 14,
              padding: '8px 12px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              minWidth: 120,
              maxWidth: 220,
              fontSize: 13,
              lineHeight: 1.4,
              color: '#222',
              zIndex: 10,
              whiteSpace: 'normal',
              textAlign: 'center',
            }}
          >
            {isThinking ? (
              <span style={{ display: 'inline-flex', gap: 4 }}>
                <Dot delay={0} />
                <Dot delay={0.15} />
                <Dot delay={0.3} />
              </span>
            ) : (
              bubbleText
            )}
            {/* ذيل الفقاعة */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: 12,
                height: 12,
                background: '#ffffff',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* الجسم - ثابت، حركة idle خفيفة (تنفّس/تمايل) */}
      <motion.img
        src={bodyImg}
        alt="robot body"
        animate={{
          y: [0, -4, 0],
          rotate: isExcited ? [0, -2, 2, 0] : 0,
        }}
        transition={{
          y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 0.5, repeat: isExcited ? Infinity : 0 },
        }}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          width: 95,
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
      />

      {/* الراس - فوق الجسم، bob + tilt خفيف */}
      <motion.img
        src={headImg}
        alt="robot head"
        animate={{
          y: [0, -6, 0],
          rotate: isExcited ? [0, -6, 6, -4, 0] : [0, -1.5, 1.5, 0],
        }}
        transition={{
          y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          rotate: {
            duration: isExcited ? 0.45 : 3.2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        style={{
          position: 'absolute',
          left: '50%',
          top: -8,
          width: 88,
          transform: 'translateX(-50%)',
          transformOrigin: 'center bottom',
          zIndex: 3,
        }}
      />

      {/* الذراع اليمين - مفصلية عند الكتف (يمين الجسم) */}
      <motion.img
        src={armRightImg}
        alt="robot right arm"
        animate={{
          rotate: isExcited ? [0, -25, 10, -15, 0] : [0, -6, 0],
        }}
        transition={{
          duration: isExcited ? 0.5 : 2.6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        style={{
          position: 'absolute',
          right: -18,
          top: 78,
          width: 58,
          transformOrigin: '85% 30%', // نقطة الكتف القريبة من الجسم
          zIndex: 2,
        }}
      />

      {/* الذراع الشمال - مفصلية عند الكتف (شمال الجسم) */}
      <motion.img
        src={armLeftImg}
        alt="robot left arm"
        animate={{
          rotate: isExcited ? [0, 25, -10, 15, 0] : [0, 6, 0],
        }}
        transition={{
          duration: isExcited ? 0.5 : 2.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          left: -18,
          top: 78,
          width: 58,
          transformOrigin: '15% 30%', // نقطة الكتف القريبة من الجسم
          zIndex: 2,
        }}
      />
    </div>
  );
};

/** نقطة متحركة لمؤشر "يكتب..." بفقاعة المحادثة */
const Dot: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.span
    animate={{ y: [0, -4, 0] }}
    transition={{ duration: 0.6, repeat: Infinity, delay }}
    style={{
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: '#999',
      display: 'inline-block',
    }}
  />
);

export default RobotMascot;
