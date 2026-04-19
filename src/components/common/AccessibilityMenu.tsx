import { useState } from 'react';
import { Settings, Type, Eye, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AccessibilityMenu = () => {
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);

  const increaseFontSize = () => {
    setFontSize('large');
    document.documentElement.style.fontSize = '18px';
  };

  const decreaseFontSize = () => {
    setFontSize('small');
    document.documentElement.style.fontSize = '14px';
  };

  const resetFontSize = () => {
    setFontSize('normal');
    document.documentElement.style.fontSize = '16px';
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    if (!highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Accessibility options">
          <Eye className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={increaseFontSize}>
          <Type className="mr-2 h-4 w-4" />
          <span>Increase Text Size</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={decreaseFontSize}>
          <Type className="mr-2 h-4 w-4" />
          <span>Decrease Text Size</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={resetFontSize}>
          <Type className="mr-2 h-4 w-4" />
          <span>Reset Text Size</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleHighContrast}>
          <Contrast className="mr-2 h-4 w-4" />
          <span>{highContrast ? 'Disable' : 'Enable'} High Contrast</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
