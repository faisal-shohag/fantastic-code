import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const DEFAULT_SETTINGS = {
  editor: {
    fontSize: 14,
    tabSize: 2,
    wordWrap: "on",
    lineNumbers: true,
    minimap: true,
    bracketPairs: true,
    formatOnSave: false,
    smoothScrolling: true,
    cursorSmoothCaretAnimation: "on",
    autoIndent: "advanced",
  },
  appearance: {
    theme: "vs-dark",
    fontFamily: "Fira Code, 'Courier New', monospace",
    cursorStyle: "line",
    cursorBlinking: "phase",
  }
};

export default function EditorSettings({ open, onOpenChange }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("editorSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }
  }, []);

  const handleChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const saveSettings = () => {
    localStorage.setItem("editorSettings", JSON.stringify(settings));
    onOpenChange(false);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("editorSettings");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogDescription>
            Customize your code editor preferences. Settings will be saved to your browser.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="editor" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="fontSize">Font Size: {settings.editor.fontSize}px</Label>
                </div>
                <Slider
                  id="fontSize"
                  min={10}
                  max={24}
                  step={1}
                  value={[settings.editor.fontSize]}
                  onValueChange={(value) => handleChange("editor", "fontSize", value[0])}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="tabSize">Tab Size</Label>
                  <Select
                    value={String(settings.editor.tabSize)}
                    onValueChange={(value) => handleChange("editor", "tabSize", parseInt(value))}
                  >
                    <SelectTrigger id="tabSize" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="8">8 spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="wordWrap">Word Wrap</Label>
                <Select
                  value={settings.editor.wordWrap}
                  onValueChange={(value) => handleChange("editor", "wordWrap", value)}
                >
                  <SelectTrigger id="wordWrap" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="wordWrapColumn">Column</SelectItem>
                    <SelectItem value="bounded">Bounded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoIndent">Auto Indent</Label>
                <Select
                  value={settings.editor.autoIndent}
                  onValueChange={(value) => handleChange("editor", "autoIndent", value)}
                >
                  <SelectTrigger id="autoIndent" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="keep">Keep</SelectItem>
                    <SelectItem value="brackets">Brackets</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 justify-between">
                <Label htmlFor="lineNumbers">Line Numbers</Label>
                <Switch
                  id="lineNumbers"
                  checked={settings.editor.lineNumbers}
                  onCheckedChange={(checked) => handleChange("editor", "lineNumbers", checked)}
                />
              </div>

              <div className="flex items-center space-x-2 justify-between">
                <Label htmlFor="minimap">Minimap</Label>
                <Switch
                  id="minimap"
                  checked={settings.editor.minimap}
                  onCheckedChange={(checked) => handleChange("editor", "minimap", checked)}
                />
              </div>

              <div className="flex items-center space-x-2 justify-between">
                <Label htmlFor="bracketPairs">Bracket Pair Colorization</Label>
                <Switch
                  id="bracketPairs"
                  checked={settings.editor.bracketPairs}
                  onCheckedChange={(checked) => handleChange("editor", "bracketPairs", checked)}
                />
              </div>

              <div className="flex items-center space-x-2 justify-between">
                <Label htmlFor="formatOnSave">Format On Save</Label>
                <Switch
                  id="formatOnSave"
                  checked={settings.editor.formatOnSave}
                  onCheckedChange={(checked) => handleChange("editor", "formatOnSave", checked)}
                />
              </div>

              <div className="flex items-center space-x-2 justify-between">
                <Label htmlFor="smoothScrolling">Smooth Scrolling</Label>
                <Switch
                  id="smoothScrolling"
                  checked={settings.editor.smoothScrolling}
                  onCheckedChange={(checked) => handleChange("editor", "smoothScrolling", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleChange("appearance", "theme", value)}
                >
                  <SelectTrigger id="theme" className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vs">Light</SelectItem>
                    <SelectItem value="vs-dark">Dark</SelectItem>
                    <SelectItem value="hc-black">High Contrast Dark</SelectItem>
                    <SelectItem value="hc-light">High Contrast Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  value={settings.appearance.fontFamily}
                  onValueChange={(value) => handleChange("appearance", "fontFamily", value)}
                >
                  <SelectTrigger id="fontFamily" className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Menlo, Monaco, 'Courier New', monospace">
                      Menlo, Monaco
                    </SelectItem>
                    <SelectItem value="'Fira Code', monospace">Fira Code</SelectItem>
                    <SelectItem value="'Source Code Pro', monospace">Source Code Pro</SelectItem>
                    <SelectItem value="Consolas, 'Courier New', monospace">Consolas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="cursorStyle">Cursor Style</Label>
                <Select
                  value={settings.appearance.cursorStyle}
                  onValueChange={(value) => handleChange("appearance", "cursorStyle", value)}
                >
                  <SelectTrigger id="cursorStyle" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="underline">Underline</SelectItem>
                    <SelectItem value="line-thin">Thin Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="cursorBlinking">Cursor Blinking</Label>
                <Select
                  value={settings.appearance.cursorBlinking}
                  onValueChange={(value) => handleChange("appearance", "cursorBlinking", value)}
                >
                  <SelectTrigger id="cursorBlinking" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blink">Blink</SelectItem>
                    <SelectItem value="smooth">Smooth</SelectItem>
                    <SelectItem value="phase">Phase</SelectItem>
                    <SelectItem value="expand">Expand</SelectItem>
                    <SelectItem value="solid">Solid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
          <Button variant="outline" onClick={resetSettings} className="sm:mr-auto">
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}