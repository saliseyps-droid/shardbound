import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CAMPAIGNS } from '@/data/opponents';
import { getCard } from '@/data/cards';
import { CardView } from '@/ui/components/CardView';
import { cinematicImageUrl } from '@/ui/components/Cinematic';
import { t } from '@/i18n';

/** The newest campaign, as shown on Home above the newest set. */
const NEW_CAMPAIGN = { id: 'inferno', image: 'inf_descent', highlights: ['vod_vhessa_the_ash_serpent', 'emb_azgaroth_the_ninth_sovereign', 'tid_rimegrave_lord_of_the_frozen_lake'] };

/** Home: the newest campaign over one of its cinematic paintings, with its Legendaries and a way in. */
export function CampaignNewsBanner() {
  const camp = CAMPAIGNS.find((c) => c.id === NEW_CAMPAIGN.id);
  if (!camp) return null;
  const fights = camp.chapters.flatMap((ch) => ch.encounters);
  const cards = fights.map((e) => e.firstWinReward?.cardId).filter((id): id is string => !!id && !!getCard(id));
  const legends = cards.filter((id) => getCard(id)!.rarity === 'LEGENDARY').length;
  const bg = cinematicImageUrl(NEW_CAMPAIGN.image);
  return (
    <section className="news-banner campaign-news panel" aria-labelledby="campaign-news-title" style={bg ? ({ '--cn-bg': `url(${bg})` } as CSSProperties) : undefined}>
      <div className="news-body">
        <span className="news-kicker">{t('New campaign')}</span>
        <h2 id="campaign-news-title">{t(camp.name)}</h2>
        <p className="news-tagline">{t('Go down into the fire beneath Aethra and take the stolen Shard back from Azgaroth, the Ninth Sovereign.')}</p>
        <ul className="news-facts">
          <li>{t('{n} chapters', { n: camp.chapters.length })}</li>
          <li>{t('{n} demons to beat', { n: fights.length })}</li>
          <li>{t('{n} campaign cards, {m} Legendary', { n: cards.length, m: legends })}</li>
        </ul>
        <div className="news-actions">
          <Link to={`/campaign?c=${camp.id}`} className="btn btn-primary">
            {t('Descend')}
          </Link>
          <Link to="/patch-notes" className="btn btn-ghost">
            {t("What's new")}
          </Link>
        </div>
      </div>
      <div className="news-fan" aria-hidden>
        {NEW_CAMPAIGN.highlights.map((id, i) => (
          <div key={id} className="news-card" style={{ '--i': i - (NEW_CAMPAIGN.highlights.length - 1) / 2 } as CSSProperties}>
            <CardView card={id} width={130} />
          </div>
        ))}
      </div>
    </section>
  );
}
