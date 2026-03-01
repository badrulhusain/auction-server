export const otpTemplate = (otp: string, name?: string): string => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Verification Code</h2>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #333;">Hello ${name ? name : 'there'},</p>
        <p style="font-size: 16px; color: #555;">Please use the following verification code to complete your request. This code is valid for the next 15 minutes.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; margin: 30px 0;">
          <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #111;">${otp}</h1>
        </div>
        
        <p style="font-size: 14px; color: #777;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
      </div>
    </div>
  `;
};
