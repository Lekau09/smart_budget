import React from 'react';
import { formatGameStats, CELEBRATION_MESSAGES } from '../Utils/gamification';

const GamificationCard = ({ stats = {} }) => {
  const game = formatGameStats(stats);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20
    }}>
      {/* Level and XP */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>LEVEL</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{game.level}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>TOTAL XP</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{game.xp.toLocaleString()}</div>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>Progress to Level {game.level + 1}</span>
          <span>{game.progressPercent}%</span>
        </div>
        <div style={{
          height: 8,
          background: 'rgba(255,255,255,0.3)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${game.progressPercent}%`,
            background: 'white',
            transition: 'width 300ms ease'
          }} />
        </div>
        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>
          {game.currentLevelXP} / {game.nextLevelXP} XP
        </div>
      </div>

      {/* Streak */}
      {game.streak > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>▲</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{game.streak}-Day Streak</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Keep tracking consistently</div>
        </div>
      )}

      {/* Badges */}
      {game.badges.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>ACHIEVEMENTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: 8 }}>
            {game.badges.map(badge => (
              <div
                key={badge.id}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: 8,
                  padding: 8,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                title={badge.description}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{badge.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.2, wordBreak: 'break-word' }}>
                  {badge.name.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationCard;
