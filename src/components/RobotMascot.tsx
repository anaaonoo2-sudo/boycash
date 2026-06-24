import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import bodyImg from '../assets/robot-parts/robot_body_left3q.png';
import headImg from '../assets/robot-parts/robot_head_front.png';
import armLeftImg from '../assets/robot-parts/robot_arm_left.png';
import armRightImg from '../assets/robot-parts/robot_arm_right.png';
import { askAssistant } from '../services/aiService';

const STAGE_W = 70;
const STAGE_H = 120;

const BODY_W = 38;
const BODY_H = Math.round(BODY_W * (356 / 107));

const HEAD_W = 40;
const HEAD_H = Math.round(HEAD_W * (431 / 338));

const ARM_W = 32;
const ARM_H = Math.round(ARM_W * (121 / 297));

interface RobotMascotProps {
  initialMessage?: string;
}

const RobotMascot: React.FC<RobotMascotProps> = ({ initialMessage }) => {
  const [isThinking, setIsThinking] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(initialMessage ?? null);
  const [isExcited, setIsExcited] = useState(false);

  // Position state - robot starts at bottom right and can be dragged
  const [pos, setPos] = useState({ x: -10, y: -100 });
  const dragging = useRef(false);
  const startTouch = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsExcited(true), 600);
    const t2 = setTimeout(() => setIsExcited(false), 1800);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const handleTap = useCallback(async () => {
    if (dragging.current) return;
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
      // Auto hide bubble after 4s
      setTimeout(() => setBubbleText(null), 4000);
    }
  }, []);

  // Touch drag handlers
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = false;
    const t = e.touches[0];
    startTouch.current = { x: t.clientX, y: t.clientY, px: pos.x, py: pos.y };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const dx = t.clientX - startTouch.current.x;
    const dy = t.clientY - startTouch.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragging.current = true;
    }
    if (dragging.current) {
      setPos({ x: startTouch.current.px + dx, y: startTouch.current.py + dy });
    }
  };

  const onTouchEnd = () => {
    if (!dragging.current) handleTap();
    setTimeout(() => { dragging.current = false; }, 100);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        right: -pos.x,
        bottom: -pos.y,
        zIndex: 999,
        touchAction: 'none',
        userSelect: 'none',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={!('ontouchstart' in window) ? handleTap : undefined}
    >
      <div
        style={{
          position: 'relative',
          width: STAGE_W,
          height: STAGE_H,
          overflow: 'visible',
          cursor: 'grab',
        }}
      >
        {/* Speech bubble */}
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
                background: 'linear-gradient(135deg, #1e1b4b, #2d1b69)',
                border: '1px solid rgba(168,85,247,0.4)',
                borderRadius: 14,
                padding: '8px 12px',
                boxShadow: '0 4px 20px rgba(168,85,247,0.3)',
                minWidth: 150,
                maxWidth: 220,
                fontSize: 12,
                lineHeight: 1.5,
                color: '#e2e8f0',
                zIndex: 10,
                whiteSpace: 'normal',
                textAlign: 'right',
              }}
            >
              {/* Triangle pointer */}
              <div style={{
                position: 'absolute',
                bottom: -8,
                right: 20,
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid rgba(168,85,247,0.4)',
              }} />
              {isThinking ? (
                <span style={{ display: 'inline-flex', gap: 4 }}>
                  <Dot delay={0} /><Dot delay={0.15} /><Dot delay={0.3} />
                </span>
              ) : bubbleText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body */}
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
            transform: 'translateX(-50%)',
            zIndex: 1,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 10px 20px rgba(168,85,247,0.4))',
          }}
        />

        {/* Head */}
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
            transform: 'translateX(-50%)',
            transformOrigin: '50% 100%',
            zIndex: 3,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.5))',
          }}
        />

        {/* Right arm */}
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
            right: -12,
            top: HEAD_H + 8,
            width: ARM_W,
            height: ARM_H,
            transformOrigin: '80% 40%',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Left arm */}
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
            left: -12,
            top: HEAD_H + 8,
            width: ARM_W,
            height: ARM_H,
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
      background: '#a855f7',
      display: 'inline-block',
    }}
  />
);

export default RobotMascot;
