import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    
    let body: any = {};
    if (req.method === 'POST') {
      try { body = await req.json(); } catch (e) { body = {}; }
    }
    
    const { sponsorId } = body;
    
    if (!sponsorId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "sponsorId is required to confirm payment" 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const sponsors = await base44.entities.Sponsor.list();
    const sponsor = sponsors.find((s: any) => s.id === sponsorId);
    
    if (!sponsor) {
      return new Response(JSON.stringify({ success: false, error: "Sponsor not found" }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Update sponsor to paid + active
    await base44.entities.Sponsor.update(sponsor.id, {
      status: 'active',
      paymentStatus: 'paid',
      holdExpiry: null
    });
    
    // Update position to sold
    const positions = await base44.entities.SponsorPosition.list();
    const position = positions.find((p: any) => p.positionNumber === sponsor.positionNumber);
    if (position) {
      await base44.entities.SponsorPosition.update(position.id, {
        isAvailable: false,
        positionState: 'sold',
        holdUntil: null,
        holdBy: null
      });
    }
    
    await base44.entities.CampaignActivity.create({
      activityType: 'payment_confirmed', source: 'razorpay',
      sponsorId: sponsor.id, timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: "Payment confirmed. Sponsor is now active.",
      sponsorId: sponsor.id,
      brandName: sponsor.brandName,
      position: sponsor.positionLabel,
      amount: sponsor.amount
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, error: 'Failed to confirm payment', details: String(error) 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});