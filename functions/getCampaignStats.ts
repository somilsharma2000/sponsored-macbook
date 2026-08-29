import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const positions = await base44.entities.SponsorPosition.list();
    const sponsors = await base44.entities.Sponsor.list();
    const nominations = await base44.entities.Nomination.list();
    const activities = await base44.entities.CampaignActivity.list();
    
    const totalPositions = positions.length;
    const availablePositions = positions.filter((p: any) => p.isAvailable);
    const takenPositions = totalPositions - availablePositions.length;
    
    const activeSponsors = sponsors.filter((s: any) => 
      s.status === 'active' && s.paymentStatus === 'paid'
    );
    const totalRaised = activeSponsors.reduce((sum: number, s: any) => 
      sum + (s.amount || 0), 0
    );
    const totalTarget = 600000;
    
    const leaderboard = activeSponsors
      .map((s: any) => ({
        position: s.positionLabel,
        brandName: s.brandName,
        amount: s.amount,
        tier: s.tier,
        logoUrl: s.logoUrl,
        website: s.website
      }))
      .sort((a: any, b: any) => b.amount - a.amount);
    
    const topNominations = nominations
      .map((n: any) => ({
        brandName: n.brandName,
        brandWebsite: n.brandWebsite,
        votes: n.votes || 0,
        reason: n.reason
      }))
      .sort((a: any, b: any) => b.votes - a.votes)
      .slice(0, 10);
    
    const pageViews = activities.filter((a: any) => a.activityType === 'page_view').length;
    const qrScans = activities.filter((a: any) => a.activityType === 'qr_scan').length;
    const shares = activities.filter((a: any) => a.activityType === 'share').length;
    const applications = activities.filter((a: any) => a.activityType === 'application').length;
    
    const result = {
      campaign: {
        name: "The Sponsored MacBook",
        tagline: "Can 20 brands fund one MacBook? An experiment in brand-funded creativity.",
        target: totalTarget,
        raised: totalRaised,
        progressPercent: Math.round((totalRaised / totalTarget) * 100),
        positionsTotal: totalPositions,
        positionsTaken: takenPositions,
        positionsAvailable: availablePositions.length
      },
      stats: {
        pageViews,
        qrScans,
        shares,
        applications,
        totalNominations: nominations.length,
        totalSponsors: activeSponsors.length
      },
      leaderboard,
      topNominations,
      positions: positions.map((p: any) => ({
        positionNumber: p.positionNumber,
        displayLabel: p.displayLabel,
        price: p.price,
        tier: p.tier,
        isAvailable: p.isAvailable,
        description: p.description
      }))
    };
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch campaign stats', 
      details: String(error) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});