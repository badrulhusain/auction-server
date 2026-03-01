export const winnerTemplate = (winnerName: string, studentName: string, amount: string): string => {
    return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #10b981; color: white; padding: 25px; text-align: center;">
        <h2 style="margin: 0; font-size: 24px;">🎉 Winning Bid Confirmed!</h2>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">Congratulations <strong>${winnerName}</strong>,</p>
        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">You have successfully secured the winning bid for a new team member. Please review the details below:</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #10b981; border-radius: 4px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #111827; margin-bottom: 15px;">Bid Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: bold; width: 40%;">Candidate Name:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Winning Amount:</td>
              <td style="padding: 8px 0; color: #059669; font-weight: 600;">$${amount}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">This transaction has been automatically deducted from your team budget.</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} BidSphere Auctions. All rights reserved.</p>
      </div>
    </div>
  `;
};
