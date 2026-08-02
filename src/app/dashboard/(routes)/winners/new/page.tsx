import { loadGiveawayOptions } from '../_components/load';
import { WinnerForm } from '../_components/winner-form';

export default async function NewWinnerPage({ searchParams }: { searchParams: Promise<{ giveaway?: string }> }) {
    const { giveaway } = await searchParams;
    const giveaways = await loadGiveawayOptions();

    return <WinnerForm giveaways={giveaways} defaultGiveawayId={giveaway} />;
}
