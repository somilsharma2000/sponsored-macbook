import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    
    let body: any = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch (e) {
        body = {};
      }
    }
    
    const url = new URL(req.url);
    const { activityType, source, referrer, visitorId, sponsorId } = {
      ...body,
      activityType: body.activityType || url.searchParams.get('activityType'),
      source: body.source || url.searchParams.get('source') || 'website',
      referrer: body.referrer || url.searchParams.get('referrer') || '',
      visitorId: body.visitorId || url.searchParams.get('visitorId') || '',
      sponsorId: body.sponsorId || url.searchParams.get('sponsorId') || ''
    };
    
    if (!activityType) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "activityType is required" 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    await base44.entities.CampaignActivity.create({
      activityType,
      source,
      referrer,
      visitorId,
      sponsorId,
      timestamp: new Date().toISOString()
    });
    
    if (activityType === 'qr_scan' && sponsorId) {
      const sponsors = await base44.entities.Sponsor.list();
      const sponsor = sponsors.find((s: any) => s.id === sponsorId);
      if (sponsor) {
        await base44.entities.Sponsor.update(sponsor.id, {
          qrScans: (sponsor.qrScans || 0) + 1
        });
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      tracked: true 
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to track activity' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});