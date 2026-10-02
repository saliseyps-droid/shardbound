import logoUrl from '@/assets/logo.webp';

/** The Shardbound emblem (src/assets/logo.webp, transparent background). */
export function BrandLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return <img className={`brand-logo ${className}`} src={logoUrl} width={size} height={size} alt="" aria-hidden draggable={false} />;
}
