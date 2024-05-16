"use client";
// components/CommonForm.tsx
import React, {
  useState,
  useRef,
  useCallback,
  FormEvent,
  KeyboardEvent,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Loader,
  Send,
  Image as ImageIcon,
  StopCircle,
  Mic,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
// @ts-ignore
import MicRecorder from "mic-recorder-to-mp3";

interface CommonFormProps {
  value: string;
  loading: boolean;
  onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFormSubmit?: (event: FormEvent<HTMLFormElement>, files?: File[]) => void;
  onResetForm?: () => void;
}

export const CommonForm: React.FC<CommonFormProps> = ({
  value,
  loading,
  onInputChange,
  onFormSubmit,
  onResetForm,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState("2.6rem");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [recording, setRecording] = useState(false);
  const recorder = useRef(new MicRecorder({ bitRate: 128 }));

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        if (textareaRef.current) {
          onFormSubmit &&
            onFormSubmit(
              event as unknown as FormEvent<HTMLFormElement>,
              [imageFile, audioFile].filter(Boolean) as File[]
            );
        }
      } else if (event.key === "Enter") {
        event.preventDefault();
        const textarea = event.currentTarget;
        const cursorPosition = textarea.selectionStart;
        const newValue =
          textarea.value.slice(0, cursorPosition) +
          "\n" +
          textarea.value.slice(cursorPosition);
        textarea.value = newValue;
        const changeEvent = new Event("input", {
          bubbles: true,
        }) as unknown as React.ChangeEvent<HTMLTextAreaElement>;
        Object.defineProperty(changeEvent, "target", {
          writable: true,
          value: { value: newValue },
        });
        onInputChange(changeEvent);
        textarea.selectionStart = cursorPosition + 1;
        textarea.selectionEnd = cursorPosition + 1;
        adjustTextareaHeight(textarea);
      }
    },
    [onInputChange, onFormSubmit, imageFile, audioFile]
  );

  const handleTextAreaInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(event);
      adjustTextareaHeight(event.currentTarget);
    },
    [onInputChange]
  );

  const resetTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "2.6rem";
    }
    setTextareaHeight("2.6rem");
  }, []);

  const adjustTextareaHeight = (target: HTMLTextAreaElement) => {
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  useEffect(() => {
    if (loading) {
      resetTextareaHeight();
    }
  }, [loading, resetTextareaHeight]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      // "video/mp4": [],
    },
    multiple: false,
    noClick: true,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFormSubmit &&
      onFormSubmit(e, [imageFile, audioFile].filter(Boolean) as File[]);
  };

  useEffect(() => {
    if (!loading) {
      setImageFile(null);
      setImagePreviewUrl(null);
      setAudioFile(null);
      resetTextareaHeight();
      if (onResetForm) onResetForm();
    }
  }, [loading, onResetForm, resetTextareaHeight]);

  const startRecording = async () => {
    try {
      await recorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = async () => {
    setRecording(false);
    try {
      const [, blob] = await recorder.current.stop().getMp3();
      const audioFile = new File([blob], "recording.mp3", {
        type: "audio/mp3",
      });
      setAudioFile(audioFile);
      const url = URL.createObjectURL(blob);

      setTimeout(() => {
        if (formRef.current) {
          formRef.current.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
          );
        }
      }, 100);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div {...getRootProps()} className="p-2">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 pt-4 border-t border-primary/70"
      >
        <input {...getInputProps()} className="hidden" />
        <div className="flex space-x-4">
          <div className="my-auto space-x-4">
            <Button type="button" size={`icon`} onClick={open}>
              <ImageIcon />
            </Button>
            {recording ? (
              <Button
                type={`button`}
                size={`icon`}
                className={`bg-red-500`}
                onClick={stopRecording}
              >
                <StopCircle />
              </Button>
            ) : (
              <Button
                type={`button`}
                size={`icon`}
                className="bg-[#00923a] dark:hover:bg-primary/20"
                onClick={startRecording}
              >
                <Mic />
              </Button>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onInput={handleTextAreaInput}
            onChange={onInputChange}
            onKeyDown={handleKeyPress}
            style={{ height: textareaHeight }}
            rows={1}
            className="flex-1 p-2 resize-none min-h-8 rounded max-h-[50vh] border"
            placeholder="Chat with Gemini 1.5"
          />
          <Button type="submit" variant="icon" size={`icon`} disabled={loading}>
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <Send className="m-auto" />
            )}
          </Button>
        </div>

        {imagePreviewUrl && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="max-w-full h-auto"
            />
          </div>
        )}
      </form>
    </div>
  );
};
