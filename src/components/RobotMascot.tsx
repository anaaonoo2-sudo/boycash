import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import bodyImg from '../assets/robot-parts/robot_body_left3q.png';
import headImg from '../assets/robot-parts/robot_head_front.png';
import armLeftImg from '../assets/robot-parts/robot_arm_left.png';
import armRightImg from '../assets/robot-parts/robot_arm_right.png';
import { askAssistant } from '../services/aiService';

// نسب الأبعاد الحقيقية للصور المصدر (عرض × ارتفاع بالبكسل الأصلي)
// body_left3q: 107x356  |  head_front: 338x431  |  arm: 297x121
const STAGE_W = 64;
const STAGE_H = 110;

const BODY_W = 36;
const BODY_H = Math.round(BODY_W * (356 / 107)); // ≈ 120

const HEAD_W = 38;
const HEAD_H = Math.round(HEAD_W * (431 / 338)); // ≈ 48

const ARM_W = 30;
const ARM_H = Math.round(ARM_W * (121 / 297)); // ≈ 12

interface RobotMascotProps {
  initialMessage?: string;
}

const RobotMascot: React.FC<RobotMascotProps> = ({ initialMessage }) => {
  const [isThinking, setIsThinking] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(initialMessage ?? null);
  const [isExcited, setIsExcited] = useState(false);

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
      style={{
        position: 'fixed',
        right: 10,
        bottom: 100,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        onClick={handleTap}
        style={{
          position: 'relative',
          width: STAGE_W,
          height: STAGE_H,
          overflow: 'visible',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'manipulation',
          pointerEvents: 'auto',
        }}
      >
        <AnimatePresence>
          {(bubbleText || isThinking) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: 10,
                background: '#ffffff',
                borderRadius: 14,
                padding: '8px 12px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                minWidth: 140,
                maxWidth: 200,
                fontSize: 13,
                lineHeight: 1.4,
                color: '#222',
                zIndex: 10,
                whiteSpace: 'normal',
                textAlign: 'right',
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
            </motion.div>
          )}
        </AnimatePresence>

        <motion.img
          src={bodyImg}
          alt=""
          draggable={false}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            width: BODY_W,
            height: BODY_H,
            maxWidth: BODY_W,
            maxHeight: BODY_H,
            transform: 'translateX(-50%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        <motion.img
          src={headImg}
          alt=""
          draggable={false}
          animate={{
            y: [0, -4, 0],
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
            top: 0,
            width: HEAD_W,
            height: HEAD_H,
            maxWidth: HEAD_W,
            maxHeight: HEAD_H,
            transform: 'translateX(-50%)',
            transformOrigin: '50% 100%',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />

        <motion.img
          src={armRightImg}
          alt=""
          draggable={false}
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
            right: -10,
            top: HEAD_H + 8,
            width: ARM_W,
            height: ARM_H,
            maxWidth: ARM_W,
            maxHeight: ARM_H,
            transformOrigin: '80% 40%',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        <motion.img
          src={armLeftImg}
          alt=""
          draggable={false}
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
            left: -10,
            top: HEAD_H + 8,
            width: ARM_W,
            height: ARM_H,
            maxWidth: ARM_W,
            maxHeight: ARM_H,
            transformOrigin: '20% 40%',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

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
