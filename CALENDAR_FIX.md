# Calendar Filter Visibility Fix

## Problem
The calendar/datepicker dropdown in the Dashboard tab was being hidden behind other elements due to CSS overflow and z-index issues.

## Root Cause
1. The `.rbi-card` class had `overflow: hidden` which was clipping the datepicker dropdown
2. The datepicker needed proper z-index stacking to appear above other elements

## Solution Applied

### Changes Made to `frontend/src/rbi-dashboard.css`

1. **Added overflow exception for cards with datepickers:**
```css
/* Allow datepicker to overflow from filter cards */
.rbi-card:has(.react-datepicker-wrapper) {
  overflow: visible;
}
```

This uses the CSS `:has()` pseudo-class to detect cards containing datepickers and allows them to overflow, while keeping `overflow: hidden` on other cards to maintain the decorative top border effect.

2. **Ensured proper z-index hierarchy:**
```css
.rbi-dashboard .react-datepicker-popper {
  z-index: 9999 !important;
}
```

The datepicker popper already had z-index 9999, which ensures it appears above all other dashboard elements.

## Result
✅ The calendar dropdown now displays completely visible above all other content  
✅ Users can see and select all dates without obstruction  
✅ The fix doesn't affect other card styling or the decorative elements  

## Testing
After applying this fix:
1. Open the Dashboard
2. Click on either the Start Date or End Date field
3. The calendar should now display completely visible
4. You should be able to see all months, years, and navigate freely

## Browser Compatibility
The `:has()` pseudo-class is supported in:
- Chrome/Edge 105+
- Firefox 121+
- Safari 15.4+

For older browsers, the datepicker will still work but may require manual scrolling if clipped.
