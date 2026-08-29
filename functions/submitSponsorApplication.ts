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
    
    const {
      brandName,
      contactName,
      contactEmail,
      contactPhone,
      website,
      logoUrl,
      brandColor,
      positionNumber,
      tier,
      amount,
      founderMessage
    } = body;
    
    if (!brandName || !contactEmail || !positionNumber) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: brandName, contactEmail, positionNumber"
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const positions = await base44.entities.SponsorPosition.list();
    const position = positions.find((p: any) => p.positionNumber === positionNumber);
    
    if (!position) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Position not found" 
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!position.isAvailable) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "This position is no longer available" 
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    
    const trackingId = `SP-${Date.now().toString(36).toUpperCase()}-${positionNumber}`;
    const uniqueUrl = `?ref=${trackingId}`;
    
    const sponsor = await base44.entities.Sponsor.create({
      brandName,
      contactName,
      contactEmail,
      contactPhone,
      website,
      logoUrl,
      brandColor: brandColor || '#000000',
      positionNumber,
      positionLabel: position.displayLabel,
      tier: tier || position.tier,
      amount: amount || position.price,
      status: 'applied',
      paymentStatus: 'pending',
      trackingId,
      uniqueUrl,
      founderMessage: founderMessage || '',
      qrScans: 0,
      shareClicks: 0,
      socialMentions: 0,
      isCrown: (tier || position.tier) === 'crown',
      isFounding: (tier || position.tier) === 'founding',
      contractSigned: false,
      campaignId: 'sponsored-macbook-2026'
    });
    
    await base44.entities.SponsorPosition.update(position.id, {
      isAvailable: false
    });
    
    await base44.entities.CampaignActivity.create({
      activityType: 'application',
      source: 'website',
      sponsorId: sponsor.id,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: "Sponsor application submitted successfully!",
      sponsorId: sponsor.id,
      trackingId,
      position: position.displayLabel,
      amount: amount || position.price,
      nextSteps: [
        "You'll receive a confirmation email within 24 hours",
        "We'll schedule a 15-minute call to discuss your sponsorship",
        "After approval, you'll receive an invoice via Razorpay",
        "Once payment is confirmed, your position is locked in"
      ]
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to submit application', 
      details: String(error) 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});