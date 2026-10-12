import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { SET_INFO } from '@/config/economy';
import { NEWS } from '@/config/news';
import { poolCards } from '@/data/cards';
import { BoosterPack } from '@/ui/components/packs/BoosterPack';
import { CardView } from '@/ui/components/CardView';
import { t } from '@/i18n';
import '@/ui/styles/shop.css';

/** Home: the newest set, with its pack, a fan of its Legendaries and links to buy, browse and read about it. */
export function NewsBanner() {
  const set = SET_INFO[NEWS.setId];
  const cards = poolCards().filter((c) => c.set === NEWS.setId);
  const legends = cards.filter((c) => c.rarity === 'LEGENDARY').length;
  return (
    <section className="news-banner panel" aria-labelledby="news-title">
      <div className="news-pack">
        <BoosterPack setId={NEWS.setId} width={150} />
      </div>
      <div className="news-body">
        <span className="news-kicker">{t('New set')}</span>
        <h2 id="news-title">{set.name}</h2>
        <p className="news-tagline">{t(set.tagline)}</p>
        <ul className="news-facts">
          <li>{t('{n} new cards', { n: cards.length })}</li>
          <li>{t('{n} Legendaries', { n: legends })}</li>
          <li>{t('New: {list}', { list: NEWS.mechanics.map((m) => t(m)).join(', ') })}</li>
        </ul>
        <div className="news-actions">
          <Link to="/shop" className="btn btn-primary">
            {t('Buy packs')}
          </Link>
          <Link to={`/collection?set=${NEWS.setId}`} className="btn">
            {t('See the cards')}
          </Link>
          <Link to="/patch-notes" className="btn btn-ghost">
            {t("What's new")}
          </Link>
        </div>
      </div>
      <div className="news-fan" aria-hidden>
        {NEWS.highlights.map((id, i) => (
          <div key={id} className="news-card" style={{ '--i': i - (NEWS.highlights.length - 1) / 2 } as CSSProperties}>
            <CardView card={id} width={130} />
          </div>
        ))}
      </div>
    </section>
  );
}
