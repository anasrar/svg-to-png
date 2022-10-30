import {
	Button,
	ColorInput,
	Container,
	Group,
	MantineProvider,
	Stack,
	Text,
} from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import {
	NotificationsProvider,
	showNotification,
} from "@mantine/notifications";
import {
	IconFileAlert,
	IconFileDownload,
	IconPhoto,
	IconPhotoPlus,
	IconTrashX,
	IconUpload,
	IconX,
} from "@tabler/icons";
import { FC, useRef, useState } from "react";

const App: FC = () => {
	const refCanvas = useRef<HTMLCanvasElement>(null);
	const refDownload = useRef<HTMLAnchorElement>(null);
	const refImage = useRef<HTMLImageElement>(null);
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const refOpenFile = useRef(() => {});
	const [svgBase64Url, setSvgBase64Url] = useState("");
	const [fileName, setFileName] = useState("");
	const [dimension, setDimension] = useState("");
	const [colorBg, setColorBg] = useState("#aaaaaa");

	const onOpenFile = async (files: FileWithPath[]) => {
		const file = files[0];

		// validate svg has width and height or viewBox
		const elDummy = document.createElement("div");
		elDummy.innerHTML = await file.text();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const elSvg = elDummy.querySelector("svg")!;
		const hasWidth = elSvg.hasAttribute("width");
		const hasHeight = elSvg.hasAttribute("height");
		const hasViewBox = elSvg.hasAttribute("viewBox");

		if (!hasWidth && !hasHeight && !hasViewBox) {
			showNotification({
				color: "red",
				icon: <IconFileAlert size={18} />,
				radius: "lg",
				title: "SVG File Error",
				message: "SVG does not contain attribute width and height or viewBox",
				autoClose: 10000,
			});
			return;
		}

		if (!hasWidth && !hasHeight && hasViewBox) {
			const { viewBox } = elSvg;
			const { width, height } = viewBox.baseVal;
			elSvg.setAttribute("width", width.toString());
			elSvg.setAttribute("height", height.toString());
		}

		setFileName(file.name);

		setSvgBase64Url(
			"data:image/svg+xml;base64," + window.btoa(elSvg.outerHTML)
		);
	};

	const onImageLoaded = () => {
		if (!refImage.current || !refCanvas.current) return;

		const w = refImage.current.naturalWidth;
		const h = refImage.current.naturalHeight;
		setDimension(`${w}x${h}`);

		const canvas = refCanvas.current;
		canvas.width = w;
		canvas.height = h;

		const context = canvas.getContext("2d") as CanvasRenderingContext2D;
		context.clearRect(0, 0, w, h);
		context.drawImage(refImage.current, 0, 0);
	};

	return (
		<MantineProvider
			theme={{ colorScheme: "dark" }}
			withGlobalStyles
			withNormalizeCSS
		>
			<NotificationsProvider>
				<canvas
					ref={refCanvas}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						transform: "scale(0)",
						pointerEvents: "none",
					}}
				></canvas>

				<a ref={refDownload} style={{ display: "none" }}></a>

				<Container size="sm" px="xs">
					<Stack
						spacing="sm"
						py="xs"
						style={{
							display: "flex",
							minHeight: "100vh",
						}}
					>
						<Dropzone.FullScreen
							accept={["image/svg+xml"]}
							onDrop={onOpenFile}
							openRef={refOpenFile}
						>
							<div></div>
						</Dropzone.FullScreen>

						<Dropzone
							accept={["image/svg+xml"]}
							onDrop={onOpenFile}
							style={{
								display: svgBase64Url === "" ? "flex" : "none",
								flexGrow: 1,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Group
								position="center"
								spacing="xs"
								style={{ pointerEvents: "none" }}
							>
								<Dropzone.Accept>
									<IconUpload size={50} stroke={1.5} />
								</Dropzone.Accept>
								<Dropzone.Reject>
									<IconX size={50} stroke={1.5} />
								</Dropzone.Reject>
								<Dropzone.Idle>
									<IconPhoto size={50} stroke={1.5} />
								</Dropzone.Idle>

								<div>
									<Text size="xl" inline>
										Drag svg here or click to select svg file
									</Text>
								</div>
							</Group>
						</Dropzone>

						<div
							style={{
								position: "relative",
								display: svgBase64Url !== "" ? "block" : "none",
								flexGrow: 1,
								background: colorBg,
							}}
						>
							<img
								ref={refImage}
								src={svgBase64Url}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									objectFit: "scale-down",
									objectPosition: "center",
								}}
								onLoad={onImageLoaded}
								crossOrigin="anonymous"
								draggable={false}
							/>
						</div>

						<Group spacing="xs" position="apart">
							<div>
								<Group spacing="xs">
									<Button
										size="xs"
										radius="xl"
										color="blue"
										leftIcon={<IconPhotoPlus size={14} />}
										onClick={() => refOpenFile.current()}
									>
										Open
									</Button>
									<Button
										size="xs"
										radius="xl"
										color="green"
										leftIcon={<IconFileDownload size={14} />}
										disabled={svgBase64Url === ""}
										onClick={() => {
											if (!refDownload.current || !refCanvas.current) return;
											const a = refDownload.current;
											a.href = refCanvas.current.toDataURL("image/png");
											a.download = fileName.replace(/.svg$/, ".png");
											a.click();
										}}
									>
										Save
									</Button>
									<Button
										size="xs"
										radius="xl"
										color="red"
										leftIcon={<IconTrashX size={14} />}
										disabled={svgBase64Url === ""}
										onClick={() => {
											setDimension("");
											setSvgBase64Url("");
										}}
									>
										Clear
									</Button>
								</Group>
							</div>
							<Group spacing="xs">
								<Text weight={700} size="xs">
									{dimension}
								</Text>
								<ColorInput
									size="xs"
									radius="xl"
									value={colorBg}
									onChange={setColorBg}
									style={{ width: "5.75rem" }}
								/>
							</Group>
						</Group>
					</Stack>
				</Container>
			</NotificationsProvider>
		</MantineProvider>
	);
};

export default App;
