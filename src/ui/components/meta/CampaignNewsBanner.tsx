import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CAMPAIGNS } from '@/data/opponents';
import { getCard } from '@/data/cards';
import { CardView } from '@/ui/components/CardView';
import { cinematicImageUrl } from '@/ui/components/Cinematic';
import { t } from '@/i18n';

/** The newest campaigns, newest first, as shown on Home above the newest set. */
const NEW_CAMPAIGNS = [
  {
    id: 'heaven',
    image: 'hv_rainbow_halls',
    highlights: ['ast_halcyon_captain_of_the_pearl_gate', 'neu_the_arbiter', 'emb_azrafel_angel_of_the_red_moon'],
    tagline: 'Two Wardens, one oath: climb the Rainbow Stair to the Host above Aethra and stand trial before the Arbiter, with an AI teammate or a friend.',
    foes: '{n} knights of the Host',
    cta: 'Ascend',
  },
  {
    id: 'inferno',
    image: 'inf_descent',
    highlights: ['vod_vhessa_the_ash_serpent', 'emb_azgaroth_the_ninth_sovereign', 'tid_rimegrave_lord_of_the_frozen_lake'],
    tagline: 'Go down into the fire beneath Aethra and take the stolen Shard back from Azgaroth, the Ninth Sovereign.',
    foes: '{n} demons to beat',
    cta: 'Descend',
  },
];
type NewCampaign = (typeof NEW_CAMPAIGNS)[number];

/** Home: the newest campaigns, one banner each. */
export function CampaignNewsBanners() {
  return (
    <>
      {NEW_CAMPAIGNS.map((n) => (
        <CampaignNewsBanner key={n.id} news={n} />
      ))}
    </>
  );
}

/** One new campaign over one of its cinematic paintings, with its Legendaries and a way in. */
function CampaignNewsBanner({ news: NEW_CAMPAIGN }: { news: NewCampaign }) {
  const camp = CAMPAIGNS.find((c) => c.id === NEW_CAMPAIGN.id);
  if (!camp) return null;
  const fights = camp.chapters.flatMap((ch) => ch.encounters);
  const cards = fights.map((e) => e.firstWinReward?.cardId).filter((id): id is string => !!id && !!getCard(id));
  const legends = cards.filter((id) => getCard(id)!.rarity === 'LEGENDARY').length;
  const bg = cinematicImageUrl(NEW_CAMPAIGN.image);
  return (
    <section className={`news-banner campaign-news campaign-news-${camp.id} panel`} aria-labelledby={`campaign-news-${camp.id}`} style={bg ? ({ '--cn-bg': `url(${bg})` } as CSSProperties) : undefined}>
      <div className="news-body">
        <span className="news-kicker">{t('New campaign')}</span>
        <h2 id={`campaign-news-${camp.id}`}>{t(camp.name)}</h2>
        <p className="news-tagline">{t(NEW_CAMPAIGN.tagline)}</p>
        <ul className="news-facts">
          <li>{t('{n} chapters', { n: camp.chapters.length })}</li>
          <li>{t(NEW_CAMPAIGN.foes, { n: fights.length })}</li>
          {camp.coop && <li>{t('2 v 1 co-op')}</li>}
          <li>{t('{n} campaign cards, {m} Legendary', { n: cards.length, m: legends })}</li>
        </ul>
        <div className="news-actions">
          <Link to={`/campaign?c=${camp.id}`} className="btn btn-primary">
            {t(NEW_CAMPAIGN.cta)}
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
