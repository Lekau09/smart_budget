import { useState, useEffect } from 'react';

export default function useOnboarding(user) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const done = localStorage.getItem(`sb:onboarded:${user.id}`);
    if (!done) setShowOnboarding(true);
  }, [user?.id]);

  const completeOnboarding = () => {
    localStorage.setItem(`sb:onboarded:${user?.id}`, '1');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}