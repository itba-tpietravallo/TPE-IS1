import { useEffect, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export function useChatScroll(ref: React.RefObject<FlatList<any>>, dep: any) {
	const [isAtBottom, setIsAtBottom] = useState(true);

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { contentOffset } = event.nativeEvent;
		const isScrolledToBottom = contentOffset.y <= 20;
		setIsAtBottom(isScrolledToBottom);
	};

	useEffect(() => {
		if (ref.current && dep > 0) {
			ref.current.scrollToIndex({ index: 0, animated: true });
		}
	}, [dep, ref]);

	return { handleScroll };
}
