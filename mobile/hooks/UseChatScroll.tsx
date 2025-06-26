import { useEffect, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export function useChatScroll(ref: React.RefObject<FlatList<any>>, dep: any) {
	const [isAtBottom, setIsAtBottom] = useState(true);

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
		const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // 20px buffer
		setIsAtBottom(isScrolledToBottom);
	};

	useEffect(() => {
		if (isAtBottom && ref.current) {
			ref.current.scrollToEnd({ animated: true });
		}
	}, [dep, isAtBottom, ref]);

	return { handleScroll };
}
