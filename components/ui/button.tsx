/** @format */

import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as React from 'react';
import {
	Pressable,
	StyleSheet,
	Text,
	View,
	type PressableProps,
	type StyleProp,
	type ViewStyle,
} from 'react-native';

type ButtonVariant =
	| 'default'
	| 'destructive'
	| 'outline'
	| 'secondary'
	| 'ghost'
	| 'link';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export type ThemedButtonProps = PressableProps & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	asChild?: boolean;
	style?: StyleProp<ViewStyle>;
	children?: React.ReactNode;
};

const variantColorMap: Record<
	ButtonVariant,
	{
		background: keyof typeof Colors.light;
		text: keyof typeof Colors.light;
		border?: keyof typeof Colors.light;
	}
> = {
	default: {
		background: 'primary',
		text: 'primaryForeground',
	},
	destructive: {
		background: 'destructive',
		text: 'primaryForeground',
	},
	outline: {
		background: 'background',
		text: 'primary',
		border: 'border',
	},
	secondary: {
		background: 'secondary',
		text: 'secondaryForeground',
	},
	ghost: {
		background: 'background',
		text: 'primary',
	},
	link: {
		background: 'background',
		text: 'primary',
	},
};

const getButtonStyles = (
	variant: ButtonVariant,
	size: ButtonSize,
	themeColors: {
		background: string;
		text: string;
		border?: string;
	}
) => {
	const baseStyles: ViewStyle = {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		borderRadius: 8,
		opacity: 1,
	};

	const variantStyles: Record<ButtonVariant, ViewStyle> = {
		default: {
			backgroundColor: themeColors.background,
			borderWidth: 0,
			elevation: 2,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.2,
			shadowRadius: 1,
		},
		destructive: {
			backgroundColor: themeColors.background,
			borderWidth: 0,
			elevation: 2,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.2,
			shadowRadius: 1,
		},
		outline: {
			backgroundColor: themeColors.background,
			borderWidth: 1,
			borderColor: themeColors.border,
			elevation: 2,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.2,
			shadowRadius: 1,
		},
		secondary: {
			backgroundColor: themeColors.background,
			borderWidth: 0,
			elevation: 2,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.2,
			shadowRadius: 1,
		},
		ghost: {
			backgroundColor: 'transparent',
			borderWidth: 0,
		},
		link: {
			backgroundColor: 'transparent',
			borderWidth: 0,
		},
	};

	const sizeStyles: Record<ButtonSize, ViewStyle> = {
		default: {
			height: 44,
			paddingHorizontal: 16,
			paddingVertical: 8,
		},
		sm: {
			height: 36,
			paddingHorizontal: 12,
			paddingVertical: 6,
		},
		lg: {
			height: 48,
			paddingHorizontal: 24,
			paddingVertical: 10,
		},
		icon: {
			height: 44,
			width: 44,
			padding: 0,
		},
	};

	return StyleSheet.create({
		button: {
			...baseStyles,
			...variantStyles[variant],
			...sizeStyles[size],
		},
		text: {
			color: themeColors.text,
			fontSize: size === 'sm' ? 14 : size === 'lg' ? 16 : 15,
			fontWeight: '500',
			textAlign: 'center',
			lineHeight: size === 'sm' ? 20 : size === 'lg' ? 24 : 22,
			textDecorationLine: variant === 'link' ? 'underline' : 'none',
		},
	});
};

type StylableChild = React.ReactElement<{
	style?: StyleProp<ViewStyle>;
	disabled?: boolean;
}>;

export function ThemedButton({
	variant = 'default',
	size = 'default',
	asChild = false,
	style,
	children,
	disabled,
	...props
}: ThemedButtonProps) {
	const {
		background: backgroundKey,
		text: textKey,
		border: borderKey,
	} = variantColorMap[variant];
	const background = useThemeColor({}, backgroundKey);
	const text = useThemeColor({}, textKey);

	const borderFallback = useThemeColor(
		{},
		(borderKey ?? 'background') as keyof typeof Colors.light &
			keyof typeof Colors.dark
	);
	const border = borderKey ? borderFallback : undefined;

	const styles = getButtonStyles(variant, size, {
		background,
		text,
		border,
	});

	const Comp = asChild ? View : Pressable;

	const disabledStyles = disabled ? { opacity: 0.5 } : {};
	const buttonStyles: StyleProp<ViewStyle> = [
		styles.button,
		disabledStyles,
		style,
	];

	const pointerEventsProp = disabled ? 'none' : undefined;

	if (asChild && React.Children.count(children) === 1) {
		const child = React.Children.only(children) as StylableChild;
		return React.cloneElement(child, {
			style: [buttonStyles, child.props.style],
			disabled: disabled || child.props.disabled,
			...props,
		});
	}

	const pressableExtraProps = asChild ? {} : { disabled };

	return (
		<Comp
			style={buttonStyles}
			pointerEvents={pointerEventsProp}
			{...pressableExtraProps}
			{...props}>
			{typeof children === 'string' ? (
				<Text style={styles.text}>{children}</Text>
			) : (
				children
			)}
		</Comp>
	);
}
