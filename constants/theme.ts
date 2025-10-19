/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 *
 * @format
 */

import { Platform } from 'react-native';

const tintColorLight = '#687076';
const tintColorDark = '#fff';
const primary = '#262626';

export const Colors = {
	light: {
		tint: tintColorLight,
		icon: '#687076',
		tabIconDefault: '#687076',
		tabIconSelected: tintColorLight,
		text: '#0a0a0a',
		background: '#FFFFFF',
		primary: primary,
		primaryForeground: '#FAFAFA',
		secondary: '#F5F5F5',
		secondaryForeground: primary,
		accent: '#F5F5F5',
		accentForeground: primary,
		destructive: '#e7000b',
		border: '#E5E5E5',
		input: '#E5E5E5',
		ring: '#a1a1a1',
	},
	dark: {
		tint: tintColorDark,
		icon: '#9BA1A6',
		tabIconDefault: '#9BA1A6',
		tabIconSelected: tintColorDark,
		text: '#FAFAFA',
		background: '#262626',
		primary: '#E5E5E5',
		primaryForeground: primary,
		secondary: '#374151',
		secondaryForeground: '#FAFAFA',
		accent: '#374151',
		accentForeground: '#FAFAFA',
		destructive: '#ff6467',
		border: 'rgba(255, 255, 255, 0.1)',
		input: 'rgba(255, 255, 255, 0.15)',
		ring: '#737373',
	},
};

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: 'system-ui',
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: 'ui-serif',
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: 'ui-rounded',
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: 'ui-monospace',
	},
	default: {
		sans: 'normal',
		serif: 'serif',
		rounded: 'normal',
		mono: 'monospace',
	},
	web: {
		sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		serif: "Georgia, 'Times New Roman', serif",
		rounded:
			"'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	},
});
