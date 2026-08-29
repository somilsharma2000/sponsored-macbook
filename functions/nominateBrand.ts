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
    
    const { brandName, brandWebsite, nominatorName, nominatorEmail, reason } = body;
    
    if (!brandName) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Brand name is required" 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const existing = await base44.entities.Nomination.list();
    const found = existing.find((n: any) => 
      n.brandName?.toLowerCase() === brandName.toLowerCase()
    );
    
    if (found) {
      await base44.entities.Nomination.update(found.id, {
        votes: (found.votes || 0) + 1
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: `Vote added for ${brandName}!`,
        totalVotes: (found.votes || 0) + 1
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    const nomination = await base44.entities.Nomination.create({
      brandName,
      brandWebsite: brandWebsite || '',
      nominatorName: nominatorName || 'Anonymous',
      nominatorEmail: nominatorEmail || '',
      reason: reason || '',
      votes: 1
    });
    
    await base44.entities.CampaignActivity.create({
      activityType: 'nomination',
      source: 'website',
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: `${brandName} has been nominated!`,
      nominationId: nomination.id,
      votes: 1
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to nominate brand', 
      details: String(error) 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});